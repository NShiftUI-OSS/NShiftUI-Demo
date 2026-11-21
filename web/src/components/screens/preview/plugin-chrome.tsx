import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'
import {
  heightMode,
  textAlignment,
  widthMode,
  type ChromeValues,
} from '@/components/screens/preview/plugin-layout'

export type { ChromeValues }

export function PluginChrome({
  componentId = '',
  values,
  children,
}: {
  componentId?: string
  values: ChromeValues
  children: ReactNode
}) {
  const width = widthMode(componentId, values)
  const height = heightMode(values)
  const align = componentId === 'text' ? textAlignment(values?.alignment) : null
  const fixedBox = width === 'fixed' || height === 'fixed'

  return (
    <div
      data-plugin-chrome=""
      data-width={width}
      data-height={height}
      className={cn(
        'relative min-w-0',
        width === 'fill' && 'w-full',
        width === 'hug' && 'w-fit max-w-full',
        width === 'fixed' && 'max-w-none shrink-0',
        fixedBox && 'flex',
        align === 'center' && 'justify-center',
        align === 'trailing' && 'justify-end',
        (align === 'leading' || (fixedBox && !align)) && 'justify-start',
        fixedBox && align && 'items-center',
        fixedBox && !align && 'items-stretch [&>*]:h-full [&>*]:w-full',
        height === 'fill' && 'h-full',
      )}
      style={pluginChromeStyle(values)}
    >
      {children}
    </div>
  )
}

export function pluginChromeStyle(values: ChromeValues): CSSProperties {
  if (!values) return {}
  const numberValue = (key: string) => {
    const value = values[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  }
  const style: CSSProperties = {}
  const width = numberValue('style.width')
  const height = numberValue('style.height')
  const minWidth = numberValue('style.minWidth')
  const maxWidth = numberValue('style.maxWidth')
  const minHeight = numberValue('style.minHeight')
  const maxHeight = numberValue('style.maxHeight')
  if (width !== null) style.width = width
  if (height !== null) style.height = height
  if (minWidth !== null) style.minWidth = minWidth
  if (maxWidth !== null) style.maxWidth = maxWidth
  if (minHeight !== null) style.minHeight = minHeight
  if (maxHeight !== null) style.maxHeight = maxHeight

  const paddingEdge = (edge: string, axis: string) => {
    const specific = numberValue(`style.padding.${edge}`)
    if (specific !== null) return specific
    return numberValue(`style.padding.${axis}`) ?? 0
  }
  const paddingTop = paddingEdge('top', 'vertical')
  const paddingBottom = paddingEdge('bottom', 'vertical')
  const paddingLeading = paddingEdge('leading', 'horizontal')
  const paddingTrailing = paddingEdge('trailing', 'horizontal')
  if (paddingTop || paddingBottom || paddingLeading || paddingTrailing) {
    style.marginTop = paddingTop || undefined
    style.marginBottom = paddingBottom || undefined
    style.marginLeft = paddingLeading || undefined
    style.marginRight = paddingTrailing || undefined
  }
  const background = typeof values['style.background.color'] === 'string' ? values['style.background.color'].trim() : ''
  if (background) style.backgroundColor = previewColor(background)
  const offsetX = numberValue('style.offset.x')
  const offsetY = numberValue('style.offset.y')
  if (offsetX || offsetY) style.transform = `translate(${offsetX ?? 0}px, ${offsetY ?? 0}px)`
  return style
}

function previewColor(token: string) {
  if (token.startsWith('#')) return token
  const kebab = token.replace(/^\./, '').replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  return `var(--${kebab})`
}

export function styleSpacing(values: ChromeValues) {
  const value = values?.spacing ?? values?.['style.spacing']
  const spacing = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(spacing) && spacing > 0 ? spacing : undefined
}
