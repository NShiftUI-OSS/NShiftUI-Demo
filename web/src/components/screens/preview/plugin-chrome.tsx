import { useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ChromeValues = Record<string, string | number | boolean | string[]> | undefined

export function PluginChrome({
  values,
  measure,
  children,
}: {
  values: ChromeValues
  measure: boolean
  children: ReactNode
}) {
  const [hovered, setHovered] = useState<HTMLDivElement | null>(null)
  const style = pluginChromeStyle(values)
  if (!measure && Object.keys(style).length === 0) return children

  return (
    <div
      data-plugin-chrome=""
      className="relative w-full min-w-0"
      style={style}
      onMouseOver={(event) => {
        const deepest = (event.target as HTMLElement).closest('[data-plugin-chrome]')
        setHovered(deepest === event.currentTarget ? event.currentTarget : null)
      }}
      onMouseLeave={() => setHovered(null)}
    >
      {children}
      {hovered ? <FigmaMeasures target={hovered} /> : null}
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

  const alignment = typeof values['style.alignment'] === 'string' ? values['style.alignment'] : ''
  if (!alignment) return style
  const leading = alignment === 'leading' || alignment.endsWith('Leading')
  const trailing = alignment === 'trailing' || alignment.endsWith('Trailing')
  const top = alignment.startsWith('top')
  const bottom = alignment.startsWith('bottom')
  if (leading) style.marginRight = 'auto'
  else if (trailing) style.marginLeft = 'auto'
  else style.marginInline = 'auto'
  if (top) style.alignSelf = 'flex-start'
  else if (bottom) style.alignSelf = 'flex-end'
  else if (!leading && !trailing) style.alignSelf = 'center'
  return style
}

export function styleSpacing(values: ChromeValues) {
  const value = values?.['style.spacing']
  const spacing = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(spacing) && spacing > 0 ? spacing : undefined
}

type Measure = {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

function FigmaMeasures({ target }: { target: HTMLElement }) {
  return createPortal(
    <>
      {measureDistances(target).map((mark) => (
        <MeasureLine key={`${mark.x1}-${mark.y1}-${mark.x2}-${mark.y2}-${mark.label}`} mark={mark} />
      ))}
    </>,
    document.body,
  )
}

function measureDistances(element: HTMLElement): Measure[] {
  const self = element.getBoundingClientRect()
  let slot: HTMLElement = element
  let flow = slot.parentElement
  while (flow && flow.children.length < 2) {
    slot = flow
    flow = flow.parentElement
  }
  if (!flow) return []
  const marks: Measure[] = []
  const container = flow.getBoundingClientRect()
  const layout = flow.closest('[data-layout]')?.getAttribute('data-layout') ?? 'vertical'
  const horizontal = layout === 'horizontal' || layout === 'horizontal-scroll'
  const slots = [...flow.children]
  const index = slots.indexOf(slot)
  const first = index <= 0
  const last = index < 0 || index === slots.length - 1
  if (horizontal) {
    if (first) addSpan(marks, container.left, self.top + self.height / 2, self.left, self.top + self.height / 2)
    if (last) addSpan(marks, self.right, self.top + self.height / 2, container.right, self.top + self.height / 2)
    addSpan(marks, self.left + self.width / 2, container.top, self.left + self.width / 2, self.top)
    addSpan(marks, self.left + self.width / 2, self.bottom, self.left + self.width / 2, container.bottom)
  } else {
    if (first) addSpan(marks, self.left + self.width / 2, container.top, self.left + self.width / 2, self.top)
    if (last) addSpan(marks, self.left + self.width / 2, self.bottom, self.left + self.width / 2, container.bottom)
    addSpan(marks, container.left, self.top + self.height / 2, self.left, self.top + self.height / 2)
    addSpan(marks, self.right, self.top + self.height / 2, container.right, self.top + self.height / 2)
  }
  if (index > 0) {
    const previous = slots[index - 1].getBoundingClientRect()
    if (horizontal) {
      addSpan(marks, previous.right, self.top + self.height / 2, self.left, self.top + self.height / 2)
    } else {
      addSpan(marks, self.left + self.width / 2, previous.bottom, self.left + self.width / 2, self.top)
    }
  }
  if (index >= 0 && index < slots.length - 1) {
    const next = slots[index + 1].getBoundingClientRect()
    if (horizontal) {
      addSpan(marks, self.right, self.top + self.height / 2, next.left, self.top + self.height / 2)
    } else {
      addSpan(marks, self.left + self.width / 2, self.bottom, self.left + self.width / 2, next.top)
    }
  }
  return marks
}

function addSpan(marks: Measure[], x1: number, y1: number, x2: number, y2: number) {
  const distance = Math.round(Math.hypot(x2 - x1, y2 - y1))
  if (distance < 2) return
  marks.push({ x1, y1, x2, y2, label: String(distance) })
}

function MeasureLine({ mark }: { mark: Measure }) {
  const horizontal = Math.abs(mark.x2 - mark.x1) >= Math.abs(mark.y2 - mark.y1)
  const left = Math.min(mark.x1, mark.x2)
  const top = Math.min(mark.y1, mark.y2)
  const length = Math.max(Math.abs(mark.x2 - mark.x1), Math.abs(mark.y2 - mark.y1))

  return (
    <>
      <span
        className="pointer-events-none fixed z-[80] bg-[#f43f5e]"
        style={{
          left,
          top,
          width: horizontal ? length : 1,
          height: horizontal ? 1 : length,
        }}
      />
      <Cap x={mark.x1} y={mark.y1} horizontal={horizontal} />
      <Cap x={mark.x2} y={mark.y2} horizontal={horizontal} />
      <span
        className="pointer-events-none fixed z-[81] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[#f43f5e] px-1 text-[10px] leading-[14px] font-medium text-white tabular-nums"
        style={{ left: (mark.x1 + mark.x2) / 2, top: (mark.y1 + mark.y2) / 2 }}
      >
        {mark.label}
      </span>
    </>
  )
}

function Cap({ x, y, horizontal }: { x: number; y: number; horizontal: boolean }) {
  return (
    <span
      className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2 bg-[#f43f5e]"
      style={{
        left: x,
        top: y,
        width: horizontal ? 1 : 7,
        height: horizontal ? 7 : 1,
      }}
    />
  )
}
