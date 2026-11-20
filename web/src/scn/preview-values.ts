export type PreviewValues = Record<string, string | number | boolean | string[]> | undefined

export function previewText(values: PreviewValues, key: string, fallback: string) {
  const value = values?.[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export function previewList(values: PreviewValues, key: string, fallback: string[]) {
  const value = values?.[key]
  return Array.isArray(value) && value.length > 0 ? value : fallback
}

export function previewNumber(values: PreviewValues, key: string, fallback: number) {
  const value = values?.[key]
  return typeof value === 'number' ? value : fallback
}

export function previewFlag(values: PreviewValues, key: string, fallback: boolean) {
  const value = values?.[key]
  return typeof value === 'boolean' ? value : fallback
}
