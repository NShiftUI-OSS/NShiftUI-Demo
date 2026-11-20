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
