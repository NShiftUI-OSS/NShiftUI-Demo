import {
  screenPageSize,
  type ScreenInput,
  type ScreenPage,
  type ScreenRecord,
  type ScreenRepository,
} from '../../application/ports.js'
import { bumpPatch } from '../../domain/values.js'
import { timestamps, type Database } from './client.js'

type ScreenRow = {
  id: string
  name: string
  description: string
  rainbow_source: string
  revision: number
  version: string
  is_root: boolean
  created_at: Date
  updated_at: Date
}

function first<T>(rows: T[]): T {
  const row = rows[0]
  if (!row) throw new Error('Insert sem linha de retorno')
  return row
}

function screenFrom(row: ScreenRow): ScreenRecord {
  return {
    ...timestamps(row),
    name: row.name,
    description: row.description,
    rainbow: row.rainbow_source,
    revision: row.revision,
    version: row.version,
    isRoot: row.is_root,
  }
}

export function createRepositories(sql: Database): { screens: ScreenRepository } {
  const screens: ScreenRepository = {
    async list() {
      const rows = await sql<ScreenRow[]>`select * from screens order by name`
      return rows.map(screenFrom)
    },
    async page(query, page) {
      const term = query.trim()
      const pattern = `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
      const filter = term
        ? sql`where name ilike ${pattern} or description ilike ${pattern}`
        : sql``
      const totals = await sql<{ total: number }[]>`
        select count(*)::int as total from screens ${filter}
      `
      const total = totals[0]?.total ?? 0
      const pageCount = Math.max(1, Math.ceil(total / screenPageSize))
      const currentPage = Math.min(Math.max(page, 1), pageCount)
      const rows = await sql<ScreenRow[]>`
        select * from screens
        ${filter}
        order by name
        limit ${screenPageSize}
        offset ${(currentPage - 1) * screenPageSize}
      `
      const result: ScreenPage = {
        items: rows.map(screenFrom),
        page: currentPage,
        pageSize: screenPageSize,
        total,
        pageCount,
      }
      return result
    },
    async findById(id) {
      const rows = await sql<ScreenRow[]>`select * from screens where id = ${id}`
      return rows[0] ? screenFrom(rows[0]) : null
    },
    async findByName(name) {
      const rows = await sql<ScreenRow[]>`select * from screens where name = ${name}`
      return rows[0] ? screenFrom(rows[0]) : null
    },
    async insert(input: ScreenInput) {
      return sql.begin(async (transaction) => {
        if (input.isRoot) {
          await transaction`update screens set is_root = false where is_root = true`
        }
        const rows = await transaction<ScreenRow[]>`
          insert into screens (name, description, rainbow_source, is_root)
          values (${input.name}, ${input.description}, ${input.rainbow}, ${input.isRoot})
          returning *
        `
        const row = first(rows)
        await transaction`
          insert into screen_versions (screen_id, version, rainbow_source)
          values (${row.id}, ${row.version}, ${row.rainbow_source})
        `
        return screenFrom(row)
      })
    },
    async update(id, input) {
      return sql.begin(async (transaction) => {
        const locked = await transaction<ScreenRow[]>`
          select * from screens
          where id = ${id} and revision = ${input.revision}
          for update
        `
        const current = locked[0]
        if (!current) return null
        if (
          current.name === input.name &&
          current.description === input.description &&
          current.rainbow_source === input.rainbow &&
          current.is_root === input.isRoot
        ) {
          return screenFrom(current)
        }
        if (input.isRoot) {
          await transaction`
            update screens
            set is_root = false
            where is_root = true and id <> ${id}
          `
        }
        const rows = await transaction<ScreenRow[]>`
          update screens
          set name = ${input.name},
              description = ${input.description},
              rainbow_source = ${input.rainbow},
              is_root = ${input.isRoot},
              revision = revision + 1,
              version = ${bumpPatch(current.version)},
              updated_at = now()
          where id = ${id} and revision = ${input.revision}
          returning *
        `
        const row = rows[0]
        if (!row) return null
        await transaction`
          insert into screen_versions (screen_id, version, rainbow_source)
          values (${row.id}, ${row.version}, ${row.rainbow_source})
        `
        return screenFrom(row)
      })
    },
    async delete(id) {
      const rows = await sql<{ id: string }[]>`delete from screens where id = ${id} returning id`
      return rows.length > 0
    },
  }

  return { screens }
}
