export type ChromeValues = Record<string, string | number | boolean | string[]> | undefined

export type AxisMode = 'fixed' | 'fill' | 'hug'

// Plugins whose own view already takes the proposed width on iOS and Android.
const fillsWidth = new Set([
  'alert',
  'button-group',
  'calendar',
  'card',
  'field',
  'horizontal-list',
  'horizontal-scroll',
  'image',
  'input',
  'item',
  'layer-stack',
  'progress',
  'select',
  'separator',
  'skeleton',
  'slider',
  'tabs',
  'textarea',
  'toast',
  'toggle-group',
  'vertical-list',
  'vertical-scroll',
  'vertical-stack',
])

export function layoutNumber(values: ChromeValues, key: string) {
  const value = values?.[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function isFill(value: string | number | boolean | string[] | undefined) {
  return value === 'fill' || value === 'infinity' || value === Number.POSITIVE_INFINITY
}

export function widthMode(componentId: string, values: ChromeValues): AxisMode {
  if (layoutNumber(values, 'style.width') !== null) return 'fixed'
  if (isFill(values?.['style.maxWidth'])) return 'fill'
  if (fillsWidth.has(componentId)) return 'fill'
  return 'hug'
}

export function heightMode(values: ChromeValues): AxisMode {
  if (layoutNumber(values, 'style.height') !== null) return 'fixed'
  if (isFill(values?.['style.maxHeight'])) return 'fill'
  return 'hug'
}

export function rootItemClass(componentId: string, values: ChromeValues) {
  return widthMode(componentId, values) === 'hug' ? 'w-fit max-w-full' : 'w-full min-w-0'
}

export function textAlignment(value: string | number | boolean | string[] | undefined) {
  const token = typeof value === 'string' ? value.replace(/^\./, '') : ''
  if (token === 'center' || token === 'trailing' || token === 'leading') return token
  return 'leading'
}
