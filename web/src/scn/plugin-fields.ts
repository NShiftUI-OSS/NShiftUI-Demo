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

const icon = (name: string, label: string, defaultValue = ''): PluginField => ({
  name,
  label,
  kind: 'icon',
  defaultValue,
})

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

const safeAreaEdges = ['all', 'top', 'bottom', 'leading', 'trailing']

export const pluginStyleFields: PluginField[] = [
  text('style.background.color', 'Fundo', ''),
  select('style.background.ignoreSafeArea', 'Fundo ignora safe area', ['', ...safeAreaEdges], ''),
  select('style.ignoreSafeArea', 'Ignorar safe area', ['', ...safeAreaEdges], ''),
  number('style.padding.top', 'Padding superior', ''),
  number('style.padding.leading', 'Padding inicial', ''),
  number('style.padding.trailing', 'Padding final', ''),
  number('style.padding.horizontal', 'Padding horizontal', ''),
  number('style.padding.vertical', 'Padding vertical', ''),
  number('style.padding.bottom', 'Padding inferior', ''),
  number('style.offset.x', 'Deslocamento X', '0'),
  number('style.offset.y', 'Deslocamento Y', '0'),
  bool('style.animation.isEnabled', 'Animação', 'false'),
  select('style.animation.curve', 'Curva', ['easeInOut', 'easeIn', 'easeOut', 'linear'], 'easeInOut'),
  number('style.animation.duration', 'Duração (ms)', '300'),
  number('style.animation.delay', 'Atraso (ms)', '0'),
  number('style.width', 'Largura', ''),
  number('style.height', 'Altura', ''),
  number('style.minWidth', 'Largura mínima', ''),
  number('style.maxWidth', 'Largura máxima', ''),
  number('style.minHeight', 'Altura mínima', ''),
  number('style.maxHeight', 'Altura máxima', ''),
]

export const pluginFields: Partial<Record<PreviewPluginId, PluginField[]>> = {
  tab: [
    text('title', 'Nome', 'Aba', true),
    icon('icon', 'Ícone', 'house'),
    text('route', 'Rota', ''),
  ],
  text: [
    text('text', 'Texto', 'Text', true),
    select('style', 'Estilo', textStyle),
    select('weight', 'Peso', textWeight),
    select('color', 'Cor', textColor),
    select('alignment', 'Alinhamento', ['leading', 'center', 'trailing'], 'leading'),
  ],
  button: [
    text('title', 'Título', 'Button', true),
    select('variant', 'Variante', variant),
    select('size', 'Tamanho', ['default', 'xs', 'sm', 'lg', 'icon']),
    bool('isEnabled', 'Habilitado'),
  ],
  'button-group': [list('titles', 'Títulos', 'Day, Week, Month', true), text('selection', 'Seleção', 'Day')],
  badge: [
    text('text', 'Texto', 'Default', true),
    select('variant', 'Variante', ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link']),
    text('input', 'Input selecionável (id)', ''),
    text('value', 'Valor ao selecionar', ''),
    select('selectedVariant', 'Variante selecionada', ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link']),
  ],
  card: [],
  avatar: [
    text('initials', 'Iniciais', 'NS', true),
    text('imageURL', 'URL da imagem'),
    select('size', 'Tamanho', ['default', 'sm', 'lg', 'xl']),
  ],
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
  'for-each': [
    text('source', 'Lista (id)', 'items', true),
    number('spacing', 'Espaçamento', '12'),
    text('filterInput', 'Input do filtro', ''),
    text('filterPath', 'Campo filtrado', ''),
    text('filterAll', 'Valor que mostra tudo', ''),
    text('searchInput', 'Input da busca', ''),
    text('searchPath', 'Campo buscado', ''),
  ],
  'swipe-action': [
    text('title', 'Título', 'Ação', true),
    text('icon', 'Ícone', ''),
    select('variant', 'Variante', ['default', 'destructive']),
  ],
  'floating-button': [
    { name: 'icon', label: 'Ícone', kind: 'icon', defaultValue: 'plus' },
    text('badge', 'Badge fixo', ''),
    text('badgeList', 'Badge = itens da lista (id)', ''),
  ],
  'search-bar': [
    text('placeholder', 'Placeholder', 'Buscar'),
    text('text', 'Texto inicial', ''),
  ],
  'vertical-stack': [
    select('alignment', 'Alinhamento', ['leading', 'center', 'trailing'], 'leading'),
    number('spacing', 'Espaçamento', '0'),
  ],
  'horizontal-stack': [
    select('alignment', 'Alinhamento', ['top', 'center', 'bottom'], 'top'),
    number('spacing', 'Espaçamento', '0'),
  ],
  'layer-stack': [
    select(
      'alignment',
      'Alinhamento',
      ['topLeading', 'top', 'topTrailing', 'leading', 'center', 'trailing', 'bottomLeading', 'bottom', 'bottomTrailing'],
      'topLeading',
    ),
  ],
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
      if (!value.trim()) continue
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
