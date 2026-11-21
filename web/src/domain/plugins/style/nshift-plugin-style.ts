import {
  emptyPluginFrame,
  type NShiftPluginFrame,
} from '@/domain/plugins/style/nshift-plugin-frame'

export type NShiftAnimationCurve = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

export type NShiftPluginStyle = {
  readonly frame: NShiftPluginFrame
  readonly background?: {
    readonly color?: string
    readonly ignoreSafeArea?: string[]
  }
  readonly ignoreSafeArea?: string[]
  readonly padding?: {
    readonly top?: number
    readonly leading?: number
    readonly trailing?: number
    readonly horizontal?: number
    readonly vertical?: number
    readonly bottom?: number
  }
  readonly offset: { readonly x: number; readonly y: number }
  readonly animation?: {
    readonly isEnabled: boolean
    readonly curve: NShiftAnimationCurve
    readonly duration: number
    readonly delay: number
  }
}

export function emptyPluginStyle(): NShiftPluginStyle {
  return {
    frame: emptyPluginFrame(),
    offset: { x: 0, y: 0 },
  }
}

function edges(value: string | undefined) {
  const tokens = (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/^\./, ''))
    .filter(Boolean)
  return tokens.length > 0 ? tokens : undefined
}

function numberOr(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function pluginStyleFromFields(
  raw: Record<string, string>,
): NShiftPluginStyle {
  const dimension = (key: string) => {
    const text = (raw[key] ?? '').trim()
    if (!text) return null
    const value = Number(text)
    return Number.isFinite(value) ? value : null
  }
  const width = dimension('style.width')
  const height = dimension('style.height')
  const minWidth = dimension('style.minWidth')
  const maxWidth = dimension('style.maxWidth')
  const minHeight = dimension('style.minHeight')
  const maxHeight = dimension('style.maxHeight')
  if (width !== null && (minWidth !== null || maxWidth !== null)) {
    throw new Error('Largura fixa não combina com mínima ou máxima.')
  }
  if (height !== null && (minHeight !== null || maxHeight !== null)) {
    throw new Error('Altura fixa não combina com mínima ou máxima.')
  }
  if (minWidth !== null && maxWidth !== null && minWidth > maxWidth) {
    throw new Error('A largura mínima é maior que a máxima.')
  }
  if (minHeight !== null && maxHeight !== null && minHeight > maxHeight) {
    throw new Error('A altura mínima é maior que a máxima.')
  }
  const optionalInt = (key: string) => {
    const text = (raw[key] ?? '').trim()
    if (!text) return undefined
    const value = Number(text)
    return Number.isFinite(value) ? Math.trunc(value) : undefined
  }
  const padding = {
    top: optionalInt('style.padding.top'),
    leading: optionalInt('style.padding.leading'),
    trailing: optionalInt('style.padding.trailing'),
    horizontal: optionalInt('style.padding.horizontal'),
    vertical: optionalInt('style.padding.vertical'),
    bottom: optionalInt('style.padding.bottom'),
  }
  const color = raw['style.background.color']?.trim()
  const backgroundEdges = edges(raw['style.background.ignoreSafeArea'])
  const background = color || backgroundEdges
    ? { color: color || undefined, ignoreSafeArea: backgroundEdges }
    : undefined
  const curve = raw['style.animation.curve']
  const animationEnabled = raw['style.animation.isEnabled'] === 'true'
  const animation = animationEnabled
    ? {
        isEnabled: true,
        curve: (curve === 'linear' || curve === 'easeIn' || curve === 'easeOut' || curve === 'easeInOut'
          ? curve
          : 'easeInOut') as NShiftAnimationCurve,
        duration: numberOr(raw['style.animation.duration'], 300),
        delay: numberOr(raw['style.animation.delay'], 0),
      }
    : undefined
  return {
    background,
    ignoreSafeArea: edges(raw['style.ignoreSafeArea']),
    padding: Object.values(padding).some((value) => value !== undefined) ? padding : undefined,
    offset: {
      x: numberOr(raw['style.offset.x'], 0),
      y: numberOr(raw['style.offset.y'], 0),
    },
    animation,
    frame: { width, height, minWidth, maxWidth, minHeight, maxHeight },
  }
}
