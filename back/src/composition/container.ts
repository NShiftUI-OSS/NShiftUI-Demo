import { createUseCases } from '../application/use-cases.js'
import { applySchema, createDatabase } from '../infrastructure/db/client.js'
import { createRepositories } from '../infrastructure/db/repositories.js'
import { createRainbowParser } from '../infrastructure/rainbow/parser.js'

export async function createContainer(databaseUrl: string, schemaPath: string) {
  const db = createDatabase(databaseUrl)
  await applySchema(db, schemaPath)
  const repositories = createRepositories(db)
  return {
    db,
    useCases: createUseCases({ ...repositories, rainbow: createRainbowParser() }),
  }
}

export type Container = Awaited<ReturnType<typeof createContainer>>
