export type RainbowTokenColor =
  | 'use'
  | 'plugin'
  | 'punctuation'
  | 'version'
  | 'event'
  | 'trigger'
  | 'parameter'
  | 'string'
  | 'escape'
  | 'number'
  | 'boolean'
  | 'null'
  | 'identifier'
  | 'placeholder'
  | 'comment'
  | 'conflict'
  | 'embedded'
  | 'text'

export type RainbowToken = {
  text: string
  color: RainbowTokenColor
}

const triggerNames = new Set([
  'Navigate',
  'SendHTTPRequest',
  'Log',
  'OpenURL',
  'Present',
  'Dismiss',
  'SetValue',
  'Copy',
  'Share',
])

const embeddedLanguages = new Set(['JSON', 'YAML', 'XML', 'HTML', 'MARKDOWN'])

export function highlightRainbow(source: string): RainbowToken[] {
  const tokens: RainbowToken[] = []
  let index = 0

  while (index < source.length) {
    const rest = source.slice(index)

    const atLineStart = index === 0 || source[index - 1] === '\n'
    if (
      atLineStart &&
      (/^<{7} Sua alteração/.test(rest) ||
        rest.startsWith('=======') ||
        /^>{7} Revisão \d+/.test(rest))
    ) {
      const end = rest.indexOf('\n')
      const text = end === -1 ? rest : rest.slice(0, end)
      tokens.push({ text, color: 'conflict' })
      index += text.length
      continue
    }

    if (rest.startsWith('//')) {
      const end = rest.indexOf('\n')
      const text = end === -1 ? rest : rest.slice(0, end)
      tokens.push({ text, color: 'comment' })
      index += text.length
      continue
    }

    if (rest.startsWith('"')) {
      tokens.push(...readString(rest))
      index += tokens.at(-1)!.text.length
      continue
    }

    const placeholder = /^#\{[A-Za-z_][A-Za-z0-9_]*\}/.exec(rest)
    if (placeholder) {
      tokens.push({ text: placeholder[0], color: 'placeholder' })
      index += placeholder[0].length
      continue
    }

    const useDeclaration =
      /^use\s+[A-Za-z_][A-Za-z0-9_]*\s*@\s*[0-9]+(?:\.[0-9]+){2,}/.exec(rest)
    if (useDeclaration) {
      tokens.push(...splitUse(useDeclaration[0]))
      index += useDeclaration[0].length
      continue
    }

    if (rest.startsWith('use')) {
      tokens.push({ text: 'use', color: 'use' })
      index += 3
      continue
    }

    const embedded = /^@(JSON|YAML|XML|HTML|MARKDOWN)(?=\()/.exec(rest)
    if (embedded && embeddedLanguages.has(embedded[1])) {
      tokens.push({ text: '@', color: 'punctuation' })
      tokens.push({ text: embedded[1], color: 'embedded' })
      index += embedded[0].length
      continue
    }

    const version = /^[0-9]+(?:\.[0-9]+){2,}/.exec(rest)
    if (version) {
      tokens.push({ text: version[0], color: 'version' })
      index += version[0].length
      continue
    }

    const number = /^-?[0-9]+(?:\.[0-9]+)?/.exec(rest)
    if (number && (index === 0 || !/[A-Za-z_]/.test(source[index - 1] ?? ''))) {
      tokens.push({ text: number[0], color: 'number' })
      index += number[0].length
      continue
    }

    const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest)
    if (word) {
      const value = word[0]
      const after = source.slice(index + value.length)
      if (/^\s*:/.test(after)) {
        tokens.push({ text: value, color: 'parameter' })
      } else if (value === 'true' || value === 'false') {
        tokens.push({ text: value, color: 'boolean' })
      } else if (value === 'null') {
        tokens.push({ text: value, color: 'null' })
      } else if (/^On[A-Z]/.test(value)) {
        tokens.push({ text: value, color: 'event' })
      } else if (triggerNames.has(value)) {
        tokens.push({ text: value, color: 'trigger' })
      } else if (/^[A-Z]/.test(value)) {
        tokens.push({ text: value, color: 'plugin' })
      } else {
        tokens.push({ text: value, color: 'text' })
      }
      index += value.length
      continue
    }

    if (rest.startsWith('.') && /^[A-Za-z_]/.test(rest[1] ?? '')) {
      const ident = /^\.[A-Za-z_][A-Za-z0-9_]*/.exec(rest)!
      tokens.push({ text: ident[0], color: 'identifier' })
      index += ident[0].length
      continue
    }

    if ('{}()[],:@'.includes(rest[0])) {
      tokens.push({ text: rest[0], color: 'punctuation' })
      index += 1
      continue
    }

    tokens.push({ text: rest[0], color: 'text' })
    index += 1
  }

  return tokens
}

function splitUse(value: string): RainbowToken[] {
  const match =
    /^(use)(\s+)([A-Za-z_][A-Za-z0-9_]*)(\s*)(@)(\s*)([0-9]+(?:\.[0-9]+){2,})$/.exec(
      value,
    )
  if (!match) return [{ text: value, color: 'text' }]
  return [
    { text: match[1], color: 'use' },
    { text: match[2], color: 'text' },
    { text: match[3], color: 'plugin' },
    { text: match[4], color: 'text' },
    { text: match[5], color: 'punctuation' },
    { text: match[6], color: 'text' },
    { text: match[7], color: 'version' },
  ]
}

function readString(source: string): RainbowToken[] {
  let index = 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === '"') {
      index += 1
      break
    }
    index += 1
  }
  return [{ text: source.slice(0, index), color: 'string' }]
}
