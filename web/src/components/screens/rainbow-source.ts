import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import {
  SEARCH_BAR_BADGES_SLOT,
  isBottomSheetSlot,
  isRainbowTrigger,
  isTabBarSlot,
  isTabPlugin,
} from '@/domain/triggers/rainbow-trigger'
import {
  findSearchBarNode,
  findSheet,
  findTabBarNode,
  readFlowRoots,
  readRainbowDocument,
  type RainbowDocument,
  type RainbowNode,
  type RainbowValue,
} from '@/components/screens/rainbow-document'

type ParseEnvelope = {
  ok: boolean
  document: { nodes: RainbowNode[] } | null
  diagnostics: { message: string }[]
}

export type ScreenScrollPreview = {
  isLazy: boolean
  header: ScreenLayoutNode[]
  footer: ScreenLayoutNode[]
}

const previewIds: Record<string, string> = {
  Text: 'text',
  Image: 'image',
  Button: 'button',
  ButtonGroup: 'button-group',
  Badge: 'badge',
  Card: 'card',
  Input: 'input',
  Textarea: 'textarea',
  InputOTP: 'input-otp',
  Field: 'field',
  Select: 'select',
  Checkbox: 'checkbox',
  Radio: 'radio',
  Switch: 'switch',
  ToggleGroup: 'toggle-group',
  Slider: 'slider',
  Tabs: 'tabs',
  TabBar: 'tab-bar',
  Tab: 'tab',
  Alert: 'alert',
  Avatar: 'avatar',
  Calendar: 'calendar',
  Item: 'item',
  Attachment: 'attachment',
  Progress: 'progress',
  Separator: 'separator',
  Skeleton: 'skeleton',
  Spinner: 'spinner',
  Container: 'container',
  VerticalStack: 'vertical-stack',
  ForEach: 'for-each',
  SearchBar: 'search-bar',
  HorizontalStack: 'horizontal-stack',
  LayerStack: 'layer-stack',
  VerticalScroll: 'vertical-scroll',
  HorizontalScroll: 'horizontal-scroll',
  VerticalList: 'vertical-list',
  HorizontalList: 'horizontal-list',
}

export function sheetNodesFromDocument(document: RainbowDocument): ScreenLayoutNode[] {
  const sheet = findSheet(document)
  if (!sheet?.block) return []
  const nodes: ScreenLayoutNode[] = []
  for (const [index, child] of sheet.block.children.entries()) {
    if (isRainbowTrigger(nodeName(child)) || isBottomSheetSlot(nodeName(child))) continue
    const mapped = toLayoutNode(child, `sheet/${index}`)
    if (mapped) nodes.push(mapped)
  }
  return nodes
}

export type PreviewSheet = {
  id: string
  title: string
  fields: Record<string, string | number | boolean | string[]>
  nodes: ScreenLayoutNode[]
}

export function sheetsFromDocument(document: RainbowDocument): PreviewSheet[] {
  const screen = readFlowRoots(document).screen
  const slot = screen?.slots?.find((item) => isBottomSheetSlot(item.name.value))
  if (!slot) return []
  return slot.plugins.map((plugin, index) => {
    const fields = valuesOf(plugin)
    const rawTitle = fields.title
    const title =
      typeof rawTitle === 'string' && rawTitle.trim()
        ? rawTitle.trim()
        : nodeName(plugin) || `Bottom sheet ${index + 1}`
    const nodes: ScreenLayoutNode[] = []
    for (const [childIndex, child] of (plugin.block?.children ?? []).entries()) {
      const name = nodeName(child)
      if (
        isRainbowTrigger(name) ||
        isBottomSheetSlot(name) ||
        isTabBarSlot(name) ||
        isTabPlugin(name)
      ) {
        continue
      }
      const mapped = toLayoutNode(child, `sheet/${index}/${childIndex}`)
      if (mapped) nodes.push(mapped)
    }
    return { id: `sheet:${index}`, title, fields, nodes }
  })
}

export function layoutFromRainbow(parsed: unknown): ScreenLayoutNode[] | null {
  const envelope = parsed as ParseEnvelope
  if (!envelope.ok || !envelope.document) return null

  const roots = envelope.document.nodes
  const root = roots.length === 1 ? roots[0] : null
  const rootName = root ? nodeName(root) : ''
  const visible =
    root && rootName === 'Screen'
      ? (root.block?.children ?? [])
      : roots

  const nodes: ScreenLayoutNode[] = []
  for (const [index, node] of visible.entries()) {
    if (isBottomSheetSlot(nodeName(node)) || isTabBarSlot(nodeName(node)) || isTabPlugin(nodeName(node))) {
      continue
    }
    const mapped = toLayoutNode(node, String(index))
    if (!mapped) return null
    nodes.push(mapped)
  }
  return nodes
}

export function scrollFromParsed(parsed: unknown): ScreenScrollPreview | null {
  const document = readRainbowDocument(parsed)
  return document ? scrollFromDocument(document) : null
}

export function scrollFromDocument(document: RainbowDocument): ScreenScrollPreview {
  const screen = readFlowRoots(document).screen
  const scroll = screen
    ? screen.parameters.find((parameter) => parameter.name === 'scroll')?.value
    : undefined
  const entries = scroll?.kind === 'object' ? scroll.entries : []
  const isLazy = entries.find((entry) => entry.key === 'isLazy')?.value
  const header = entries.find((entry) => entry.key === 'header')?.value
  const footer = entries.find((entry) => entry.key === 'footer')?.value
  return {
    isLazy: isLazy?.kind === 'bool' && isLazy.value,
    header: pluginNodesFromValue(header, 'scroll/header'),
    footer: pluginNodesFromValue(footer, 'scroll/footer'),
  }
}

function pluginNodesFromValue(value: RainbowValue | undefined, path: string) {
  if (value?.kind !== 'plugins') return []
  return value.plugins.flatMap((node, index) => {
    const mapped = toLayoutNode(node, `${path}/${index}`)
    return mapped ? [mapped] : []
  })
}

function toLayoutNode(
  node: RainbowNode,
  path: string,
): ScreenLayoutNode | null {
  const componentId = previewIds[nodeName(node)]
  if (!componentId) return null

  const children: ScreenLayoutNode[] = []
  for (const [index, child] of (node.block?.children ?? []).entries()) {
    if (
      isRainbowTrigger(nodeName(child)) ||
      isBottomSheetSlot(nodeName(child)) ||
      (nodeName(node) !== 'TabBar' && (isTabBarSlot(nodeName(child)) || isTabPlugin(nodeName(child))))
    ) {
      continue
    }
    const mapped = toLayoutNode(child, `${path}/${index}`)
    if (!mapped) return null
    children.push(mapped)
  }

  // The SearchBar's Badges slot is previewed as its children.
  if (nodeName(node) === 'SearchBar') {
    const slot = node.slots?.find((item) => item.name.value === SEARCH_BAR_BADGES_SLOT)
    for (const [index, plugin] of (slot?.plugins ?? []).entries()) {
      const mapped = toLayoutNode(plugin, `${path}/badges/${index}`)
      if (mapped) children.push(mapped)
    }
  }

  return {
    id: path,
    componentId,
    plugin: null,
    props: valuesOf(node),
    children,
  }
}

function valuesOf(node: RainbowNode) {
  const values: Record<string, string | number | boolean | string[]> = {}
  for (const parameter of node.parameters ?? []) {
    assignValue(values, parameter.name, parameter.value)
  }
  for (const parameter of node.style ?? []) {
    assignValue(values, `style.${parameter.name}`, parameter.value)
  }
  return values
}

function assignValue(
  target: Record<string, string | number | boolean | string[]>,
  prefix: string,
  value: RainbowValue,
) {
  if (value.kind === 'object') {
    for (const entry of value.entries) {
      assignValue(target, `${prefix}.${entry.key}`, entry.value)
    }
    return
  }
  const plain = plainValue(value)
  if (plain !== undefined) target[prefix] = plain
}

function plainValue(value: RainbowValue): string | number | boolean | string[] | undefined {
  switch (value.kind) {
    case 'string':
    case 'placeholder':
      return value.value
    case 'identifier':
      return value.value.replace(/^\./, '')
    case 'int':
    case 'double':
      return value.value
    case 'bool':
      return value.value
    case 'array': {
      const items = value.values.flatMap((item) =>
        item.kind === 'string' ? [item.value] : [],
      )
      return items.length > 0 ? items : undefined
    }
    default:
      return undefined
  }
}

function nodeName(node: RainbowNode) {
  return node.name.kind === 'ident' ? node.name.value : node.name.value
}

export function searchBarFromParsed(parsed: unknown): ScreenLayoutNode | null {
  const document = readRainbowDocument(parsed)
  return document ? searchBarFromDocument(document) : null
}

export function searchBarFromDocument(document: RainbowDocument): ScreenLayoutNode | null {
  const bar = findSearchBarNode(document)
  return bar ? toLayoutNode(bar, 'searchBar') : null
}

export function tabBarFromParsed(parsed: unknown): ScreenLayoutNode | null {
  const document = readRainbowDocument(parsed)
  return document ? tabBarFromDocument(document) : null
}

export function tabBarFromDocument(document: RainbowDocument): ScreenLayoutNode | null {
  const bar = findTabBarNode(document)
  return bar ? toLayoutNode(bar, 'tabBar') : null
}
