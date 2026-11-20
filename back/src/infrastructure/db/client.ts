import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

import postgres from 'postgres'

export function createDatabase(databaseUrl: string) {
  return postgres(databaseUrl, { onnotice: () => undefined })
}

export async function applySchema(sql: postgres.Sql, schemaPath: string) {
  const info = await stat(schemaPath)
  const files = info.isDirectory()
    ? (await readdir(schemaPath))
        .filter((name) => name.endsWith('.sql'))
        .sort()
        .map((name) => join(schemaPath, name))
    : [schemaPath]
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    await sql.unsafe(text)
  }
}

export type Database = postgres.Sql

type Row = {
  id: string
  created_at: Date
  updated_at: Date
}

export function timestamps(row: Row) {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}
