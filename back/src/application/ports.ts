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
  update(id: string, input: ScreenInput & { revision: number }): Promise<ScreenRecord | null>
  delete(id: string): Promise<boolean>
}

export interface RainbowParser {
  format(source: string): { ok: true; formatted: string } | { ok: false; message: string }
}

export type Repositories = {
  screens: ScreenRepository
  rainbow: RainbowParser
}
