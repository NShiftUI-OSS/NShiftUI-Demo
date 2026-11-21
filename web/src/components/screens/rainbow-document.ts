import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { NShiftPluginStyle } from '@/domain/plugins/style/nshift-plugin-style'
import {
  BOTTOM_SHEET_SLOT,
  SHEET_PLUGIN,
  isBottomSheetSlot,
} from '@/domain/triggers/rainbow-trigger'
import type { PluginMetadataValue } from '@/scn/plugin-fields'

export type RainbowName = {
  kind: 'ident' | 'placeholder'
  value: string
}

export type RainbowValue =
  | { kind: 'string'; value: string }
  | { kind: 'int'; value: number }
  | { kind: 'double'; value: number }
  | { kind: 'bool'; value: boolean }
  | { kind: 'identifier'; value: string }
  | { kind: 'placeholder'; value: string }
  | { kind: 'null' }
  | { kind: 'array'; values: RainbowValue[] }
  | { kind: 'object'; entries: { key: string; value: RainbowValue }[] }
  | { kind: 'plugins'; plugins: RainbowNode[] }
  | {
      kind: 'tagged'
      language: string
      body:
        { kind: 'text'; value: string } | { kind: 'placeholder'; value: string }
    }

export type RainbowParameter = {
  name: string
  value: RainbowValue
  leading?: { comments: string[] }
}

export type RainbowTrigger = {
  name: RainbowName
  events: RainbowNode[]
  leading?: { comments: string[] }
}

export type RainbowSlot = {
  name: RainbowName
  plugins: RainbowNode[]
  leading?: { comments: string[] }
}

export type RainbowNode = {
  name: RainbowName
  parameters: RainbowParameter[]
  block: { children: RainbowNode[] } | null
  id?: string | null
  style?: RainbowParameter[]
  events?: RainbowTrigger[]
  slots?: RainbowSlot[]
  leading?: { comments: string[] }
}

export type RainbowUse = {
  name: RainbowName
  version: string | null
  leading?: { comments: string[] }
}

export type RainbowDocument = {
  uses: RainbowUse[]
  nodes: RainbowNode[]
}

export function defaultRainbowSource(screenId: string) {
  return `use Screen@1.0.0\n\nScreen(\n  name: "${escapeString(screenId)}",\n  scroll: (enabled: false, fastRefresh: true)\n) {\n}\n`
}

export function readRainbowDocument(parsed: unknown): RainbowDocument | null {
  const envelope = parsed as {
    ok?: boolean
    document?: RainbowDocument | null
  }
  if (!envelope.ok || !envelope.document) return null
  return envelope.document
}

export function insertPlugin(
  document: RainbowDocument,
  targetId: string | null,
  plugin: NShiftPluginModel,
  acceptsChildren: boolean,
  index = Number.POSITIVE_INFINITY,
) {
  const list = childrenOf(document, targetId)
  if (!list) return false
  ensureUse(document, plugin.name.rawValue, plugin.version.rawValue)
  const at = Math.max(0, Math.min(index, list.length))
  list.splice(at, 0, pluginToNode(plugin, acceptsChildren))
  return true
}

export function moveNode(
  document: RainbowDocument,
  nodeId: string,
  targetId: string | null,
  index = Number.POSITIVE_INFINITY,
) {
  if (
    targetId !== null &&
    (targetId === nodeId || targetId.startsWith(`${nodeId}/`))
  ) {
    return false
  }

  const target = childrenOf(document, targetId)
  const source = parentList(document, nodeId)
  if (!target || !source) return false

  const [node] = source.list.splice(source.index, 1)
  if (!node) return false
  const at = Math.max(0, Math.min(index, target.length))
  target.splice(at, 0, node)
  return true
}

export function printRainbowDocument(document: RainbowDocument) {
  const uses = document.uses.map(printUse).filter(Boolean)
  const nodes = document.nodes.map((node) => printNode(node, 0))
  return [...uses, '', ...nodes].join('\n').replace(/\n{3,}/g, '\n\n')
}

function pluginToNode(
  plugin: NShiftPluginModel,
  acceptsChildren: boolean,
): RainbowNode {
  return {
    name: { kind: 'ident', value: plugin.name.rawValue },
    parameters: parametersFromPlugin(plugin),
    block: acceptsChildren ? { children: [] } : null,
    id: plugin.id,
    style: styleParameters(plugin.style),
    events: [],
    slots: [],
    leading: { comments: [] },
  }
}

function parametersFromPlugin(plugin: NShiftPluginModel): RainbowParameter[] {
  const parameters: RainbowParameter[] = []
  const metadata = plugin.metadata?.base
  if (metadata) {
    for (const [name, value] of Object.entries(metadata)) {
      if (name === 'id') continue
      const printed = valueToRainbow(value)
      if (printed) parameters.push(parameter(name, printed))
    }
  }

  return parameters
}

function styleParameters(style: NShiftPluginStyle): RainbowParameter[] {
  const parameters: RainbowParameter[] = [
    parameter('alignment', { kind: 'identifier', value: style.alignment }),
    parameter('spacing', numberValue(style.spacing)),
  ]
  for (const name of [
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
  ] as const) {
    const value = style.frame[name]
    if (value !== null) parameters.push(parameter(name, numberValue(value)))
  }
  return parameters
}

function parameter(name: string, value: RainbowValue): RainbowParameter {
  return { name, value, leading: { comments: [] } }
}

function numberValue(value: number): RainbowValue {
  return Number.isInteger(value)
    ? { kind: 'int', value }
    : { kind: 'double', value }
}

function valueToRainbow(value: unknown): RainbowValue | null {
  if (typeof value === 'string') return { kind: 'string', value }
  if (typeof value === 'boolean') return { kind: 'bool', value }
  if (typeof value === 'number') return numberValue(value)
  if (value === null) return { kind: 'null' }
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return {
      kind: 'array',
      values: value.map((item) => ({ kind: 'string', value: item })),
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries: { key: string; value: RainbowValue }[] = []
    for (const [key, item] of Object.entries(value)) {
      const nested = valueToRainbow(item)
      if (nested) entries.push({ key, value: nested })
    }
    return { kind: 'object', entries }
  }
  return null
}

function ensureUse(document: RainbowDocument, name: string, version: string) {
  const existing = document.uses.find(
    (declaration) =>
      declaration.name.kind === 'ident' && declaration.name.value === name,
  )
  if (existing) {
    existing.version = version
    return
  }

  document.uses.push({
    name: { kind: 'ident', value: name },
    version,
    leading: { comments: [] },
  })
}

export function ensureBottomSheet(document: RainbowDocument) {
  const screen = readFlowRoots(document).screen
  if (!screen) return false
  screen.slots ??= []
  let slot = screen.slots.find((item) => isBottomSheetSlot(item.name.value))
  if (!slot) {
    slot = {
      name: { kind: 'ident', value: BOTTOM_SHEET_SLOT },
      plugins: [],
      leading: { comments: [] },
    }
    screen.slots.push(slot)
  }
  const existing = slot.plugins.find((child) => nodeName(child) === SHEET_PLUGIN)
  if (!existing) {
    ensureUse(document, SHEET_PLUGIN, '1.0.0')
    slot.plugins.push({
      name: { kind: 'ident', value: SHEET_PLUGIN },
      parameters: [parameter('title', { kind: 'string', value: 'Bottom sheet' })],
      block: { children: [] },
      id: null,
      style: [],
      events: [],
      slots: [],
      leading: { comments: [] },
    })
  }
  return true
}

export function removeBottomSheet(document: RainbowDocument) {
  const screen = readFlowRoots(document).screen
  if (!screen?.slots) return false
  const index = screen.slots.findIndex((item) => isBottomSheetSlot(item.name.value))
  if (index < 0) return false
  screen.slots.splice(index, 1)
  if (!findSheet(document)) {
    document.uses = document.uses.filter(
      (declaration) =>
        declaration.name.kind !== 'ident' || declaration.name.value !== SHEET_PLUGIN,
    )
  }
  return true
}

export function findSheet(document: RainbowDocument) {
  const screen = readFlowRoots(document).screen
  const slot = screen?.slots?.find((item) => isBottomSheetSlot(item.name.value))
  return slot?.plugins.find((child) => nodeName(child) === SHEET_PLUGIN) ?? null
}

function childrenOf(document: RainbowDocument, targetId: string | null) {
  if (targetId === 'sheet') return sheetChildren(document)
  if (targetId?.startsWith('sheet/')) {
    return walkChildren(sheetChildren(document), targetId.slice('sheet/'.length))
  }
  if (targetId === null) return visibleRoots(document)
  return walkChildren(visibleRoots(document), targetId)
}

function walkChildren(start: RainbowNode[] | null, path: string) {
  if (!start) return null
  const indexes = path.split('/').map(Number)
  if (indexes.some((index) => Number.isNaN(index))) return null
  let list = start
  let node: RainbowNode | undefined
  for (const index of indexes) {
    node = list[index]
    if (!node) return null
    node.block ??= { children: [] }
    list = node.block.children
  }
  return list
}

function sheetChildren(document: RainbowDocument) {
  const sheet = findSheet(document)
  if (!sheet) return null
  sheet.block ??= { children: [] }
  return sheet.block.children
}

export function readPlacedPlugin(document: RainbowDocument, nodeId: string) {
  const node =
    nodeId === 'screen' ? readFlowRoots(document).screen : nodeAt(document, nodeId, false)
  if (!node || node.name.kind !== 'ident') return null
  const name = node.name.value
  const declaration = document.uses.find(
    (item) => item.name.kind === 'ident' && item.name.value === name,
  )
  const fields: Record<string, string> = {}
  for (const item of node.parameters) {
    appendFieldValues(fields, item.name, item.value)
  }
  for (const item of node.style ?? []) {
    appendFieldValues(fields, `style.${item.name}`, item.value)
  }
  if (node.id) fields.id = node.id
  return { name, version: declaration?.version ?? '1.0.0', fields }
}

export function updatePlacedPlugin(
  document: RainbowDocument,
  nodeId: string,
  input: {
    name: string
    version: string
    metadata: Record<string, PluginMetadataValue>
    fieldNames: string[]
    style?: NShiftPluginStyle
  },
) {
  const node =
    nodeId === 'screen' ? readFlowRoots(document).screen : nodeAt(document, nodeId, false)
  if (!node) return false
  const managedRoots = new Set(
    input.fieldNames.map((fieldName) => fieldName.split('.')[0]),
  )
  if (input.style) managedRoots.add('style')
  const kept = node.parameters.filter(
    (item) => !managedRoots.has(item.name) && item.name !== 'id',
  )
  node.name = { kind: 'ident', value: input.name }
  node.parameters = [...metadataParameters(input.metadata), ...kept]
  if (input.style) node.style = styleParameters(input.style)
  ensureUse(document, input.name, input.version)
  return true
}

export function removePlacedPlugin(document: RainbowDocument, nodeId: string) {
  if (nodeId === 'screen') return false
  const source = parentList(document, nodeId)
  if (!source) return false
  source.list.splice(source.index, 1)
  return true
}

function fieldString(value: RainbowValue): string | undefined {
  switch (value.kind) {
    case 'string':
    case 'placeholder':
    case 'identifier':
      return value.value
    case 'bool':
      return value.value ? 'true' : 'false'
    case 'int':
    case 'double':
      return String(value.value)
    case 'array':
      if (!value.values.every((item) => item.kind === 'string')) return undefined
      return value.values.map((item) => (item.kind === 'string' ? item.value : '')).join(', ')
    default:
      return undefined
  }
}

function appendFieldValues(
  target: Record<string, string>,
  prefix: string,
  value: RainbowValue,
) {
  if (value.kind === 'object') {
    for (const entry of value.entries) {
      appendFieldValues(target, `${prefix}.${entry.key}`, entry.value)
    }
    return
  }
  const stringValue = fieldString(value)
  if (stringValue !== undefined) target[prefix] = stringValue
}

function parentList(document: RainbowDocument, nodeId: string) {
  if (nodeId === 'sheet') return null
  const sheetPath = nodeId.startsWith('sheet/')
  const indexes = (sheetPath ? nodeId.slice('sheet/'.length) : nodeId).split('/').map(Number)
  const index = indexes.at(-1)
  if (index === undefined || indexes.some((item) => Number.isNaN(item))) return null
  const parentId = sheetPath
    ? indexes.length === 1
      ? 'sheet'
      : `sheet/${indexes.slice(0, -1).join('/')}`
    : indexes.length === 1
      ? null
      : indexes.slice(0, -1).join('/')
  const list = childrenOf(document, parentId)
  if (!list?.[index]) return null
  return { list, index }
}

export function readFlowRoots(document: RainbowDocument) {
  const [screen] = document.nodes
  const name = screen ? nodeName(screen) : ''
  if (
    document.nodes.length === 1 &&
    screen &&
    name === 'Screen'
  ) {
    return { screen, roots: screen.block?.children ?? [] }
  }
  return { screen: null, roots: document.nodes }
}

function visibleRoots(document: RainbowDocument) {
  const { screen, roots } = readFlowRoots(document)
  if (!screen) return roots
  screen.block ??= { children: [] }
  return screen.block.children
}

export function insertTriggerEvent(
  document: RainbowDocument,
  hostId: string,
  triggerName: string,
  event: {
    name: string
    version: string
    metadata: Record<string, PluginMetadataValue>
    jsonParameters?: readonly string[]
  },
) {
  const host = hostId ? nodeAt(document, hostId, true) : readFlowRoots(document).screen
  if (!host) return false
  host.events ??= []
  let trigger = host.events.find((item) => item.name.value === triggerName)
  if (!trigger) {
    trigger = {
      name: { kind: 'ident', value: triggerName },
      events: [],
      leading: { comments: [] },
    }
    host.events.push(trigger)
  }
  ensureUse(document, event.name, event.version)
  trigger.events.push({
    name: { kind: 'ident', value: event.name },
    parameters: metadataParameters(event.metadata, event.jsonParameters ?? []),
    block: null,
    id: null,
    style: [],
    events: [],
    slots: [],
    leading: { comments: [] },
  })
  return true
}

function nodeAt(
  document: RainbowDocument,
  nodeId: string,
  ensureBlock: boolean,
) {
  if (nodeId === 'sheet') return findSheet(document)
  const sheetPath = nodeId.startsWith('sheet/')
  const indexes = (sheetPath ? nodeId.slice('sheet/'.length) : nodeId).split('/').map(Number)
  if (indexes.length === 0 || indexes.some((index) => Number.isNaN(index))) {
    return null
  }
  let list = sheetPath ? sheetChildren(document) : visibleRoots(document)
  if (!list) return null
  let node: RainbowNode | undefined
  for (let depth = 0; depth < indexes.length; depth += 1) {
    node = list[indexes[depth]]
    if (!node) return null
    if (depth === indexes.length - 1) return node
    if (ensureBlock) node.block ??= { children: [] }
    if (!node.block) return null
    list = node.block.children
  }
  return null
}

function metadataParameters(
  metadata: Record<string, PluginMetadataValue>,
  jsonParameters: readonly string[] = [],
): RainbowParameter[] {
  const tagged = new Set(jsonParameters)
  const parameters: RainbowParameter[] = []
  for (const [name, value] of Object.entries(metadata)) {
    if (tagged.has(name) && typeof value === 'string') {
      parameters.push(
        parameter(name, {
          kind: 'tagged',
          language: 'JSON',
          body: { kind: 'text', value },
        }),
      )
      continue
    }
    const printed = valueToRainbow(value)
    if (printed) parameters.push(parameter(name, printed))
  }
  return parameters
}

function nodeName(node: RainbowNode) {
  return node.name.value
}

function printUse(declaration: RainbowUse) {
  const comments = printComments(declaration.leading?.comments ?? [], 0)
  const version = declaration.version ? `@${declaration.version}` : ''
  const name =
    declaration.name.kind === 'placeholder'
      ? `#{${declaration.name.value}}`
      : declaration.name.value
  return `${comments}use ${name}${version}`
}

function printNode(node: RainbowNode, indent: number): string {
  const pad = '  '.repeat(indent)
  const comments = printComments(node.leading?.comments ?? [], indent)
  const name =
    node.name.kind === 'placeholder' ? `#{${node.name.value}}` : node.name.value
  const parameters = printParameters(node.parameters, indent, node.block == null)
  const header = `${comments}${pad}${name}${parameters}`
  const lines: string[] = []
  if (node.block) {
    lines.push(`${header} {`)
    for (const child of node.block.children) {
      const printed = printNode(child, indent + 1)
      if (printed) lines.push(printed)
    }
    lines.push(`${pad}}`)
  } else {
    lines.push(header)
  }
  if (node.id) lines.push(`${pad}.id("${escapeString(node.id)}")`)
  const style = node.style ?? []
  if (style.length > 0) {
    lines.push(`${pad}.style(`)
    style.forEach((item, index) => {
      const comma = index === style.length - 1 ? '' : ','
      lines.push(
        `${printComments(item.leading?.comments ?? [], indent + 1)}${'  '.repeat(indent + 1)}${item.name}: ${printValue(item.value, indent + 1)}${comma}`,
      )
    })
    lines.push(`${pad})`)
  }
  const events = node.events ?? []
  if (events.length > 0) {
    lines.push(`${pad}.events {`)
    for (const trigger of events) {
      const triggerPad = '  '.repeat(indent + 1)
      const triggerName =
        trigger.name.kind === 'placeholder'
          ? `#{${trigger.name.value}}`
          : trigger.name.value
      lines.push(
        `${printComments(trigger.leading?.comments ?? [], indent + 1)}${triggerPad}${triggerName} {`,
      )
      for (const event of trigger.events) {
        const printed = printNode(event, indent + 2)
        if (printed) lines.push(printed)
      }
      lines.push(`${triggerPad}}`)
    }
    lines.push(`${pad}}`)
  }
  if ((node.slots ?? []).length > 0) {
    lines.push(...printSlots(node.slots ?? [], indent))
  }
  return lines.join('\n')
}

function printSlots(slots: RainbowSlot[], indent: number): string[] {
  const pad = '  '.repeat(indent)
  const lines = [`${pad}.slots {`]
  for (const slot of slots) {
    const slotPad = '  '.repeat(indent + 1)
    lines.push(
      `${printComments(slot.leading?.comments ?? [], indent + 1)}${slotPad}${slot.name.value} {`,
    )
    for (const plugin of slot.plugins) {
      const printed = printNode(plugin, indent + 2)
      if (printed) lines.push(printed)
    }
    lines.push(`${slotPad}}`)
  }
  lines.push(`${pad}}`)
  return lines
}

function printParameters(
  parameters: RainbowParameter[],
  indent: number,
  constructor: boolean,
) {
  if (parameters.length === 0) return constructor ? '()' : ''
  const pad = '  '.repeat(indent + 1)
  const body = parameters
    .map(
      (parameter) =>
        `${printComments(parameter.leading?.comments ?? [], indent + 1)}${pad}${parameter.name}: ${printValue(parameter.value)}`,
    )
    .join(',\n')
  return `(\n${body}\n${'  '.repeat(indent)})`
}

function printComments(comments: string[], indent: number) {
  if (comments.length === 0) return ''
  const pad = '  '.repeat(indent)
  return `${comments.map((comment) => `${pad}//${comment}`).join('\n')}\n`
}

function printValue(value: RainbowValue, indent = 0): string {
  switch (value.kind) {
    case 'string':
      return `"${escapeString(value.value)}"`
    case 'int':
    case 'double':
      return String(value.value)
    case 'bool':
      return value.value ? 'true' : 'false'
    case 'identifier':
      return `.${value.value}`
    case 'placeholder':
      return `#{${value.value}}`
    case 'null':
      return 'null'
    case 'array':
      return `[${value.values.map((item) => printValue(item, indent)).join(', ')}]`
    case 'object':
      return `(${value.entries
        .map((entry) => `${printKey(entry.key)}: ${printValue(entry.value, indent)}`)
        .join(', ')})`
    case 'plugins': {
      const pad = '  '.repeat(indent)
      if (value.plugins.length === 0) return '{}'
      return `{\n${value.plugins
        .map((plugin) => printNode(plugin, indent + 1))
        .filter(Boolean)
        .join('\n')}\n${pad}}`
    }
    case 'tagged':
      return `@${value.language}(${
        value.body.kind === 'placeholder'
          ? `#{${value.body.value}}`
          : value.body.value
      })`
  }
}

function printKey(key: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `"${escapeString(key)}"`
}

function escapeString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}
