import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import { isBottomSheetSlot, isRainbowTrigger } from '@/domain/triggers/rainbow-trigger'
import {
  findSheet,
  type RainbowDocument,
  type RainbowNode,
  type RainbowValue,
} from '@/components/screens/rainbow-document'

type ParseEnvelope = {
  ok: boolean
  document: { nodes: RainbowNode[] } | null
  diagnostics: { message: string }[]
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
    if (isBottomSheetSlot(nodeName(node))) continue
    const mapped = toLayoutNode(node, String(index))
    if (!mapped) return null
    nodes.push(mapped)
  }
  return nodes
}

function toLayoutNode(
  node: RainbowNode,
  path: string,
): ScreenLayoutNode | null {
  const componentId = previewIds[nodeName(node)]
  if (!componentId) return null

  const children: ScreenLayoutNode[] = []
  for (const [index, child] of (node.block?.children ?? []).entries()) {
    if (isRainbowTrigger(nodeName(child)) || isBottomSheetSlot(nodeName(child))) continue
    const mapped = toLayoutNode(child, `${path}/${index}`)
    if (!mapped) return null
    children.push(mapped)
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

export function separateTabBar(nodes: ScreenLayoutNode[]) {
  let tabBar: ScreenLayoutNode | null = null
  const strip = (list: ScreenLayoutNode[]): ScreenLayoutNode[] =>
    list.flatMap((node) => {
      if (node.componentId === 'tab-bar') {
        tabBar ??= node
        return []
      }
      return [{ ...node, children: strip(node.children) }]
    })
  return { content: strip(nodes), tabBar }
}
