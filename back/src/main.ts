import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { createContainer } from './composition/container.js'
import { createApp } from './interfaces/http/app.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const port = Number(process.env.PORT ?? 3000)
const schemaPath = fileURLToPath(new URL('../sql/', import.meta.url))
const container = await createContainer(databaseUrl, schemaPath)
const tlsCertificatePath = process.env.TLS_CERT_PATH
const tlsKeyPath = process.env.TLS_KEY_PATH
const https =
  tlsCertificatePath && tlsKeyPath
    ? {
        cert: await readFile(tlsCertificatePath),
        key: await readFile(tlsKeyPath),
      }
    : undefined
const app = createApp(container.useCases, { https })

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (error) {
  app.log.error(error)
  await container.db.end()
  process.exit(1)
}
