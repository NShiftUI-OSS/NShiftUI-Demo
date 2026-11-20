import init, { format, parse, validate, version } from 'rainbow-parser-wasm-web'

let ready: Promise<void> | null = null

export function loadRainbowParser() {
  ready ??= init().then(() => undefined)
  return ready
}

export async function parseRainbow(source: string) {
  await loadRainbowParser()
  return JSON.parse(parse(source)) as unknown
}

export async function validateRainbow(source: string, concrete = false) {
  await loadRainbowParser()
  return JSON.parse(validate(source, concrete)) as unknown
}

export async function formatRainbow(source: string) {
  await loadRainbowParser()
  return JSON.parse(format(source)) as {
    ok: boolean
    formatted: string | null
    diagnostics: { message: string }[]
  }
}

export async function rainbowParserVersion() {
  await loadRainbowParser()
  return version()
}
