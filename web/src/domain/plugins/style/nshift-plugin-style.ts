import {
  nshiftPluginAlignments,
  type NShiftPluginAlignment,
} from '@/domain/plugins/style/nshift-plugin-alignment'
import {
  emptyPluginFrame,
  type NShiftPluginFrame,
} from '@/domain/plugins/style/nshift-plugin-frame'

export type NShiftPluginStyle = {
  readonly frame: NShiftPluginFrame
  readonly alignment: NShiftPluginAlignment
  readonly spacing: number
}

export function emptyPluginStyle(): NShiftPluginStyle {
  return {
    frame: emptyPluginFrame(),
    alignment: 'center',
    spacing: 0,
  }
}

export function pluginStyleFromFields(
  raw: Record<string, string>,
): NShiftPluginStyle {
  const alignment = raw['style.alignment']
  const spacing = Number(raw['style.spacing'] || '0')
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
  const known = nshiftPluginAlignments.includes(
    alignment as NShiftPluginAlignment,
  )
  return {
    alignment: known ? (alignment as NShiftPluginAlignment) : 'center',
    spacing: Number.isFinite(spacing) ? spacing : 0,
    frame: { width, height, minWidth, maxWidth, minHeight, maxHeight },
  }
}
