export type NShiftPluginDimension =
  { readonly type: 'fill' } | { readonly type: 'value'; readonly value: number }

export const fillDimension: NShiftPluginDimension = { type: 'fill' }

export function dimensionValue(value: number): NShiftPluginDimension {
  return { type: 'value', value }
}

export function dimensionDoubleValue(dimension: NShiftPluginDimension) {
  return dimension.type === 'fill' ? Number.POSITIVE_INFINITY : dimension.value
}
