import { scnPresets, type ScnPresetId } from '@/scn/presets'

export function readScreenTheme(source: string): ScnPresetId | null {
  const args = rootArguments(source)
  if (!args) return null
  const navigationBar = objectArguments(args.value, 'navigationBar') ?? args.value
  const named =
    navigationBar.match(/theme:\s*"([^"]+)"/) ??
    navigationBar.match(/theme:\s*([A-Za-z]+)/)
  const id = named?.[1]?.toLowerCase()
  return scnPresets.some((preset) => preset.id === id) ? (id as ScnPresetId) : 'neutral'
}

export type ScreenChrome = {
  title: string
  navigationLeading: 'auto' | 'none' | 'back' | 'button'
  navigationLeadingIcon: string
  navigationTrailing: 'none' | 'close' | 'button'
  navigationTrailingIcon: string
  navigationBackground: string
  navigationCenterIcon: string
}

export function readScreenChrome(source: string): ScreenChrome | null {
  const args = rootArguments(source)
  if (!args) return null
  return chromeFromArguments(
    objectArguments(args.value, 'navigationBar') ?? args.value,
  )
}

export function navigationBarVisible(chrome: ScreenChrome) {
  return Boolean(
    chrome.title ||
      chrome.navigationLeading === 'back' ||
      chrome.navigationLeading === 'button' ||
      chrome.navigationLeadingIcon ||
      chrome.navigationTrailing !== 'none' ||
      chrome.navigationTrailingIcon ||
      chrome.navigationCenterIcon ||
      (chrome.navigationBackground && chrome.navigationBackground !== 'background'),
  )
}

function chromeFromArguments(args: string): ScreenChrome {
  const leading = argument(args, 'leading')
  const trailing = argument(args, 'trailing')
  return {
    title: argument(args, 'title') ?? '',
    navigationLeading:
      leading === 'none' || leading === 'back' || leading === 'button' ? leading : 'auto',
    navigationLeadingIcon: argument(args, 'leadingIcon') ?? '',
    navigationTrailing: trailing === 'close' || trailing === 'button' ? trailing : 'none',
    navigationTrailingIcon: argument(args, 'trailingIcon') ?? '',
    navigationBackground: argument(args, 'background') ?? '',
    navigationCenterIcon: argument(args, 'centerIcon') ?? '',
  }
}

function argument(args: string, name: string) {
  const match = args.match(
    new RegExp(`${name}:\\s*("(?:\\\\.|[^"\\\\])*"|true|false|[A-Za-z0-9_-]+)`),
  )
  if (!match) return undefined
  const raw = match[1]
  if (raw.startsWith('"')) return raw.slice(1, -1).replace(/\\"/g, '"')
  return raw
}

export function writeScreenTheme(source: string, theme: ScnPresetId) {
  const root = rootArguments(source)
  if (!root) return source
  const navigationBar = objectArguments(root.value, 'navigationBar')
  if (navigationBar) {
    const nextNavigationBar = navigationBar.replace(
      /theme:\s*("[^"]*"|[A-Za-z]+)/,
      `theme: "${theme}"`,
    )
    const withTheme = /theme:/.test(navigationBar)
      ? nextNavigationBar
      : `${navigationBar.trimEnd()},\n    theme: "${theme}"\n  `
    const marker = `navigationBar: (${navigationBar})`
    const replacement = `navigationBar: (${withTheme})`
    const nextValue = root.value.replace(marker, replacement)
    return source.slice(0, root.start) + nextValue + source.slice(root.end)
  }
  const trimmed = root.value.trim()
  const nextValue =
    trimmed.length === 0
      ? `navigationBar: (theme: "${theme}")`
      : `${trimmed},\n  navigationBar: (theme: "${theme}")`
  return source.slice(0, root.start) + nextValue + source.slice(root.end)
}

function rootArguments(source: string) {
  const match = /(?:^|\n)\s*(?:Screen|WebView)\s*\(/.exec(source)
  if (!match || match.index === undefined) return null
  const start = source.indexOf('(', match.index)
  const end = matchingParenthesis(source, start)
  if (end < 0) return null
  return {
    start: start + 1,
    end,
    value: source.slice(start + 1, end),
  }
}

function objectArguments(source: string, name: string) {
  const match = new RegExp(`${name}:\\s*\\(`).exec(source)
  if (!match || match.index === undefined) return null
  const start = source.indexOf('(', match.index)
  const end = matchingParenthesis(source, start)
  if (end < 0) return null
  return source.slice(start + 1, end)
}

function matchingParenthesis(source: string, start: number) {
  let depth = 0
  let quoted = false
  let escaped = false
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        quoted = false
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === '(') {
      depth += 1
    } else if (char === ')') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}
