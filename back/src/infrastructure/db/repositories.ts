import {
  auditPageSize,
  screenPageSize,
  type AuditAction,
  type AuditPage,
  type AuditRecord,
  type ScreenInput,
  type ScreenPage,
  type ScreenRecord,
  type ScreenRepository,
  type ScreenVersionRecord,
} from '../../application/ports.js'
import { bumpPatch } from '../../domain/values.js'
import type { JSONValue } from 'postgres'

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

type VersionRow = {
  screen_id: string
  version: string
  name: string
  description: string
  rainbow_source: string
  is_root: boolean
  created_at: Date
  current_version: string
}

type AuditRow = {
  id: string
  created_at: Date
  action: AuditAction
  entity_type: 'screen'
  entity_id: string | null
  entity_name: string
  summary: string
  version: string | null
  payload: Record<string, unknown>
}

type AuditEntry = {
  action: AuditAction
  entityId: string | null
  entityName: string
  summary: string
  version: string | null
  payload: Record<string, unknown>
}

async function writeAudit(sql: Database, entry: AuditEntry) {
  await sql`
    insert into audit_logs (
      action, entity_type, entity_id, entity_name, summary, version, payload
    )
    values (
      ${entry.action},
      'screen',
      ${entry.entityId},
      ${entry.entityName},
      ${entry.summary},
      ${entry.version},
      ${sql.json(entry.payload as JSONValue)}
    )
  `
}

function publishSummary(current: ScreenRow, next: ScreenRow, restoredFrom?: string) {
  if (restoredFrom) {
    return `Restaurou a tela ${next.name} a partir da versão ${restoredFrom} e publicou ${next.version}.`
  }
  const changes: string[] = []
  if (current.name !== next.name) changes.push(`renomeou de ${current.name} para ${next.name}`)
  if (current.description !== next.description) changes.push('alterou a descrição')
  if (current.is_root !== next.is_root) {
    changes.push(next.is_root ? 'marcou como tela raiz' : 'tirou a marca de tela raiz')
  }
  if (current.rainbow_source !== next.rainbow_source) changes.push('alterou o Rainbow')
  const detail = changes.length > 0 ? changes.join(', ') : 'atualizou os dados'
  return `Publicou a tela ${next.name} na versão ${next.version}: ${detail}.`
}

function versionFrom(row: VersionRow): ScreenVersionRecord {
  return {
    screenId: row.screen_id,
    version: row.version,
    name: row.name,
    description: row.description,
    rainbow: row.rainbow_source,
    isRoot: row.is_root,
    createdAt: row.created_at.toISOString(),
    current: row.version === row.current_version,
  }
}

function auditFrom(row: AuditRow): AuditRecord {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    summary: row.summary,
    version: row.version,
    payload: row.payload ?? {},
  }
}

export function createRepositories(sql: Database): {
  screens: ScreenRepository
  audit: { page: (action: string, page: number) => Promise<AuditPage> }
} {
  const screens: ScreenRepository = {
    async list() {
      const rows = await sql<ScreenRow[]>`select * from screens order by is_root desc, name`
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
        order by is_root desc, name
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
          insert into screen_versions (
            screen_id, version, name, description, rainbow_source, is_root
          )
          values (
            ${row.id},
            ${row.version},
            ${row.name},
            ${row.description},
            ${row.rainbow_source},
            ${row.is_root}
          )
        `
        await writeAudit(transaction as unknown as Database, {
          action: 'screen.created',
          entityId: row.id,
          entityName: row.name,
          summary: `Criou a tela ${row.name} na versão ${row.version}.`,
          version: row.version,
          payload: {
            name: row.name,
            description: row.description,
            isRoot: row.is_root,
            revision: row.revision,
          },
        })
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
          insert into screen_versions (
            screen_id, version, name, description, rainbow_source, is_root
          )
          values (
            ${row.id},
            ${row.version},
            ${row.name},
            ${row.description},
            ${row.rainbow_source},
            ${row.is_root}
          )
        `
        await writeAudit(transaction as unknown as Database, {
          action: 'screen.published',
          entityId: row.id,
          entityName: row.name,
          summary: publishSummary(current, row, input.restoredFrom),
          version: row.version,
          payload: {
            previousVersion: current.version,
            previousName: current.name,
            name: row.name,
            description: row.description,
            isRoot: row.is_root,
            revision: row.revision,
            rainbowChanged: current.rainbow_source !== row.rainbow_source,
            restoredFrom: input.restoredFrom ?? null,
          },
        })
        return screenFrom(row)
      })
    },
    async delete(id) {
      return sql.begin(async (transaction) => {
        const existing = await transaction<ScreenRow[]>`
          select * from screens where id = ${id} for update
        `
        const current = existing[0]
        if (!current) return false
        const history = await transaction<{ version: string }[]>`
          select version from screen_versions
          where screen_id = ${id}
          order by created_at
        `
        await writeAudit(transaction as unknown as Database, {
          action: 'screen.deleted',
          entityId: current.id,
          entityName: current.name,
          summary: `Apagou a tela ${current.name}, que estava na versão ${current.version}.`,
          version: current.version,
          payload: {
            name: current.name,
            description: current.description,
            isRoot: current.is_root,
            revision: current.revision,
            versions: history.map((item) => item.version),
            rainbow: current.rainbow_source,
          },
        })
        const rows = await transaction<{ id: string }[]>`
          delete from screens where id = ${id} returning id
        `
        return rows.length > 0
      })
    },
    async activate(id, version, revision) {
      return sql.begin(async (transaction) => {
        const locked = await transaction<ScreenRow[]>`
          select * from screens
          where id = ${id} and revision = ${revision}
          for update
        `
        const current = locked[0]
        if (!current) return null
        if (current.version === version) return screenFrom(current)
        const snapshots = await transaction<
          {
            version: string
            name: string
            description: string
            rainbow_source: string
            is_root: boolean
          }[]
        >`
          select version, name, description, rainbow_source, is_root
          from screen_versions
          where screen_id = ${id} and version = ${version}
        `
        const snapshot = snapshots[0]
        if (!snapshot) return null
        if (snapshot.is_root) {
          await transaction`
            update screens
            set is_root = false
            where is_root = true and id <> ${id}
          `
        }
        const rows = await transaction<ScreenRow[]>`
          update screens
          set name = ${snapshot.name},
              description = ${snapshot.description},
              rainbow_source = ${snapshot.rainbow_source},
              is_root = ${snapshot.is_root},
              version = ${snapshot.version},
              revision = revision + 1,
              updated_at = now()
          where id = ${id} and revision = ${revision}
          returning *
        `
        const row = rows[0]
        if (!row) return null
        await writeAudit(transaction as unknown as Database, {
          action: 'screen.activated',
          entityId: row.id,
          entityName: row.name,
          summary: `Passou a entregar a versão ${snapshot.version} da tela ${row.name}. Nenhuma versão nova foi criada.`,
          version: snapshot.version,
          payload: {
            previousVersion: current.version,
            version: snapshot.version,
            name: row.name,
            revision: row.revision,
          },
        })
        return screenFrom(row)
      })
    },
    async versions(id) {
      const rows = await sql<VersionRow[]>`
        select
          version.screen_id,
          version.version,
          version.name,
          version.description,
          version.rainbow_source,
          version.is_root,
          version.created_at,
          screen.version as current_version
        from screen_versions as version
        join screens as screen on screen.id = version.screen_id
        where version.screen_id = ${id}
        order by version.created_at desc
      `
      return rows.map(versionFrom)
    },
  }

  const audit = {
    async page(action: string, page: number) {
      const filter = action
        ? sql`where action = ${action}`
        : sql``
      const totals = await sql<{ total: number }[]>`
        select count(*)::int as total from audit_logs ${filter}
      `
      const total = totals[0]?.total ?? 0
      const pageCount = Math.max(1, Math.ceil(total / auditPageSize))
      const currentPage = Math.min(Math.max(page, 1), pageCount)
      const rows = await sql<AuditRow[]>`
        select * from audit_logs
        ${filter}
        order by created_at desc
        limit ${auditPageSize}
        offset ${(currentPage - 1) * auditPageSize}
      `
      const result: AuditPage = {
        items: rows.map(auditFrom),
        page: currentPage,
        pageSize: auditPageSize,
        total,
        pageCount,
      }
      return result
    },
  }

  return { screens, audit }
}
