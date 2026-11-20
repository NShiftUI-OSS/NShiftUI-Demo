import { createRequire } from 'node:module'

import type { RainbowParser } from '../../application/ports.js'

const require = createRequire(import.meta.url)
const rainbow = require('rainbow-parser-wasm-node') as {
  format: (source: string) => string
  validate: (source: string, concrete?: boolean) => string
}

type Envelope = {
  ok?: boolean
  formatted?: string | null
  diagnostics?: { message?: string }[]
}

export function createRainbowParser(): RainbowParser {
  return {
    format(source) {
      const formatted = JSON.parse(rainbow.format(source)) as Envelope
      if (!formatted.ok || !formatted.formatted) {
        return { ok: false, message: messageOf(formatted) }
      }
      const validated = JSON.parse(rainbow.validate(formatted.formatted, true)) as Envelope
      if (!validated.ok) return { ok: false, message: messageOf(validated) }
      return { ok: true, formatted: formatted.formatted }
    },
  }
}

function messageOf(envelope: Envelope) {
  return envelope.diagnostics?.find((item) => item.message)?.message ?? 'Rainbow inválido'
}
