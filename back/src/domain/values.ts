const screenNamePattern = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export function screenName(value: string) {
  if (!screenNamePattern.test(value)) throw new DomainError(`Nome de tela inválido: ${value}`)
  return value
}

const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/

export function bumpPatch(version: string) {
  const match = semverPattern.exec(version)
  if (!match) throw new Error(`Versão inválida: ${version}`)
  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`
}

export function defaultRainbow(name: string) {
  const escaped = name.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `use Screen@1.0.0\n\nScreen(\n  name: "${escaped}",\n  scroll: (enabled: false, isLazy: false, fastRefresh: true)\n) {\n}\n`
}
