import type { PreviewPluginId } from '@/di/registrations'

export type PluginMetadataValue =
  | string
  | number
  | boolean
  | string[]
  | { [key: string]: PluginMetadataValue }

export type PluginField = {
  name: string
  label: string
  kind: 'text' | 'number' | 'boolean' | 'select' | 'list' | 'icon'
  options?: string[]
  optionLabels?: string[]
  defaultValue: string
  required?: boolean
  embedded?: 'JSON'
}

const text = (
  name: string,
  label: string,
  defaultValue = '',
  required = false,
): PluginField => ({
  name,
  label,
  kind: 'text',
  defaultValue,
  required,
})

const number = (
  name: string,
  label: string,
  defaultValue: string,
  required = false,
): PluginField => ({
  name,
  label,
  kind: 'number',
  defaultValue,
  required,
})

const bool = (name: string, label: string, defaultValue = 'true'): PluginField => ({
  name,
  label,
  kind: 'boolean',
  defaultValue,
})

const list = (
  name: string,
  label: string,
  defaultValue: string,
  required = false,
): PluginField => ({
  name,
  label,
  kind: 'list',
  defaultValue,
  required,
})

const select = (
  name: string,
  label: string,
  options: string[],
  defaultValue = options[0] ?? '',
): PluginField => ({
  name,
  label,
  kind: 'select',
  options,
  defaultValue,
})

const variant = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link']
const textStyle = ['sm', 'xs', 'base', 'lg', 'xl', 'xl2']
const textWeight = ['regular', 'medium', 'semibold']
const textColor = ['foreground', 'mutedForeground', 'primary', 'destructive']

export const pluginStyleFields: PluginField[] = [
  select(
    'style.alignment',
    'Alinhamento',
    [
      'topLeading',
      'top',
      'topTrailing',
      'leading',
      'center',
      'trailing',
      'bottomLeading',
      'bottom',
      'bottomTrailing',
    ],
    'center',
  ),
  number('style.spacing', 'Espaçamento', '0'),
  number('style.width', 'Largura', ''),
  number('style.height', 'Altura', ''),
  number('style.minWidth', 'Largura mínima', ''),
  number('style.maxWidth', 'Largura máxima', ''),
  number('style.minHeight', 'Altura mínima', ''),
  number('style.maxHeight', 'Altura máxima', ''),
]

pluginStyleFields[0].optionLabels = [
  'Topo à esquerda',
  'Topo',
  'Topo à direita',
  'Esquerda',
  'Centro',
  'Direita',
  'Base à esquerda',
  'Base',
  'Base à direita',
]

export const pluginFields: Partial<Record<PreviewPluginId, PluginField[]>> = {
  text: [
    text('text', 'Texto', 'Text', true),
    select('style', 'Estilo', textStyle),
    select('weight', 'Peso', textWeight),
    select('color', 'Cor', textColor),
  ],
  button: [
    text('title', 'Título', 'Button', true),
    select('variant', 'Variante', variant),
    select('size', 'Tamanho', ['default', 'xs', 'sm', 'lg', 'icon']),
    bool('isEnabled', 'Habilitado'),
  ],
  'button-group': [list('titles', 'Títulos', 'Day, Week, Month', true), text('selection', 'Seleção', 'Day')],
  badge: [text('text', 'Texto', 'Default', true), select('variant', 'Variante', ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'])],
  avatar: [text('initials', 'Iniciais', 'NS', true), select('size', 'Tamanho', ['default', 'sm', 'lg'])],
  alert: [
    text('title', 'Título', 'Warning', true),
    text('message', 'Mensagem', 'Something needs your review.'),
    select('variant', 'Variante', ['default', 'destructive']),
  ],
  input: [text('text', 'Texto'), text('placeholder', 'Placeholder', 'Name'), bool('isSecure', 'Senha', 'false')],
  textarea: [text('text', 'Texto'), text('placeholder', 'Placeholder', 'Write a message')],
  'input-otp': [number('length', 'Casas', '6', true), text('code', 'Código', '12')],
  field: [text('label', 'Rótulo', 'Name', true), text('hint', 'Dica', 'Shown on your profile')],
  select: [list('options', 'Opções', 'One, Two, Three', true), text('selection', 'Seleção', 'One')],
  checkbox: [text('title', 'Título', 'Checked', true), bool('isOn', 'Marcado')],
  radio: [text('title', 'Título', 'Option', true), bool('isOn', 'Marcado')],
  switch: [bool('isOn', 'Ligado')],
  'toggle-group': [list('options', 'Opções', 'Day, Week, Month', true), text('selection', 'Seleção', 'Day')],
  slider: [number('value', 'Valor', '0.45', true)],
  progress: [number('value', 'Valor', '0.6', true)],
  tabs: [list('titles', 'Abas', 'Account, Password', true), text('selection', 'Seleção', 'Account')],
  item: [text('title', 'Título', 'Ada Lovelace', true), text('subtitle', 'Subtítulo', 'Mathematics'), text('initials', 'Iniciais', 'AL')],
  attachment: [
    text('title', 'Arquivo', 'report.pdf', true),
    text('detail', 'Detalhe', 'Ready'),
    select('state', 'Estado', ['done', 'idle', 'uploading', 'processing', 'error']),
  ],
  skeleton: [number('height', 'Altura', '16')],
  calendar: [number('selection', 'Data', '0', true)],
}

export function fieldsFor(previewId?: string) {
  if (!previewId) return []
  return pluginFields[previewId as PreviewPluginId] ?? []
}

export function initialFieldValues(previewId?: string) {
  return Object.fromEntries(fieldsFor(previewId).map((field) => [field.name, field.defaultValue]))
}

export function initialStyleValues() {
  return Object.fromEntries(pluginStyleFields.map((field) => [field.name, field.defaultValue]))
}

export function metadataFromFieldList(
  fields: PluginField[],
  raw: Record<string, string>,
) {
  const metadata: Record<string, PluginMetadataValue> = {}
  for (const field of fields) {
    const value = raw[field.name] ?? field.defaultValue
    let parsed: PluginMetadataValue | null = null
    if (field.kind === 'boolean') {
      parsed = value === 'true'
    } else if (field.kind === 'number') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        setNestedMetadata(metadata, field.name, parsed)
      }
      continue
    } else if (field.kind === 'list') {
      const items = value.split(',').map((item) => item.trim()).filter(Boolean)
      if (items.length > 0) parsed = items
    } else if (value.trim()) {
      parsed = value
    }
    if (parsed !== null) {
      setNestedMetadata(metadata, field.name, parsed)
    }
  }
  return metadata
}

export function metadataFromFields(previewId: string | undefined, raw: Record<string, string>) {
  return metadataFromFieldList(fieldsFor(previewId), raw)
}

function setNestedMetadata(
  target: Record<string, PluginMetadataValue>,
  path: string,
  value: PluginMetadataValue,
) {
  const parts = path.split('.')
  if (parts.length === 1) {
    target[path] = value
    return
  }
  const [head, ...rest] = parts
  const current = target[head]
  const nested: Record<string, PluginMetadataValue> =
    current && !Array.isArray(current) && typeof current === 'object'
      ? current
      : {}
  setNestedMetadata(nested, rest.join('.'), value)
  target[head] = nested
}
