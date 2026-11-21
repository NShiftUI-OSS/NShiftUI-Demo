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

export type ScreenInput = {
  name: string
  description: string
  rainbow: string
  isRoot: boolean
}

export type ScreenVersionRecord = {
  screenId: string
  version: string
  name: string
  description: string
  rainbow: string
  isRoot: boolean
  createdAt: string
  current: boolean
}

export type AuditAction = 'screen.created' | 'screen.published' | 'screen.deleted'

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

export const auditPageSize = 20

export type ScreenPage = {
  items: ScreenRecord[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export const screenPageSize = 4

export interface ScreenRepository {
  list(): Promise<ScreenRecord[]>
  page(query: string, page: number): Promise<ScreenPage>
  findById(id: string): Promise<ScreenRecord | null>
  findByName(name: string): Promise<ScreenRecord | null>
  insert(input: ScreenInput): Promise<ScreenRecord>
  update(
    id: string,
    input: ScreenInput & { revision: number; restoredFrom?: string },
  ): Promise<ScreenRecord | null>
  delete(id: string): Promise<boolean>
  versions(id: string): Promise<ScreenVersionRecord[]>
}

export interface AuditRepository {
  page(action: string, page: number): Promise<AuditPage>
}

export interface RainbowParser {
  format(source: string): { ok: true; formatted: string } | { ok: false; message: string }
}

export type Repositories = {
  screens: ScreenRepository
  audit: AuditRepository
  rainbow: RainbowParser
}
