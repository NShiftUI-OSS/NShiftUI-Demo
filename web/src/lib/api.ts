const baseUrl = import.meta.env.VITE_API_URL ?? 'https://127.0.0.1:3000'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export type ScreenRecord = {
  id: string
  name: string
  description: string
  rainbow: string
  revision: number
  version: string
  isRoot: boolean
  createdAt: string
  updatedAt: string
}

export type ScreenVersion = {
  screenId: string
  version: string
  name: string
  description: string
  rainbow: string
  isRoot: boolean
  createdAt: string
  current: boolean
}

export type AuditAction =
  | 'screen.created'
  | 'screen.published'
  | 'screen.deleted'
  | 'screen.activated'

export type AuditRecord = {
  id: string
  createdAt: string
  action: AuditAction
  entityType: 'screen'
  entityId: string | null
  entityName: string
  summary: string
  version: string | null
  payload: Record<string, unknown>
}

export type AuditPage = {
  items: AuditRecord[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  let body: { data?: T; error?: { code?: string; message?: string } } = {}
  try {
    body = (await response.json()) as typeof body
  } catch {
    throw new ApiError(response.status, 'invalid_response', 'Falha na API')
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? 'unknown',
      body.error?.message ?? 'Falha na API',
    )
  }
  return body.data as T
}

export type ScreenPage = {
  items: ScreenRecord[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export const api = {
  screens: (page = 1, query = '') => {
    const params = new URLSearchParams({ page: String(page) })
    if (query.trim()) params.set('q', query.trim())
    return request<ScreenPage>(`/screens?${params.toString()}`)
  },
  storyboard: () =>
    request<StoryboardData>('/storyboard'),
  screen: (id: string) => request<ScreenRecord>(`/screens/${id}`),
  screenVersions: (id: string) => request<ScreenVersion[]>(`/screens/${id}/versions`),
  activateScreenVersion: (id: string, version: string, revision: number) =>
    request<ScreenRecord>(`/screens/${id}/versions/${encodeURIComponent(version)}/activate`, {
      method: 'POST',
      body: JSON.stringify({ revision }),
    }),
  audit: (page = 1, action = '') => {
    const params = new URLSearchParams({ page: String(page) })
    if (action) params.set('action', action)
    return request<AuditPage>(`/audit?${params.toString()}`)
  },
  createScreen: (input: {
    name: string
    description: string
    rainbow?: string
    isRoot?: boolean
  }) =>
    request<ScreenRecord>('/screens', { method: 'POST', body: JSON.stringify(input) }),
  updateScreen: (
    id: string,
    input: {
      name: string
      description: string
      rainbow: string
      revision: number
      isRoot: boolean
      restoredFrom?: string
    },
  ) => request<ScreenRecord>(`/screens/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteScreen: (id: string) => request<null>(`/screens/${id}`, { method: 'DELETE' }),
}

export type StoryboardData = {
  screens: ScreenRecord[]
  edges: Array<{
    id: string
    source: string
    sourceName: string
    target: string
    targetName: string
    event: string
    async: boolean
    targetExists: boolean
  }>
}
