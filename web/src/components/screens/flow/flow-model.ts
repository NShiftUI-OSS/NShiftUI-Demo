import type {
  RainbowDocument,
  RainbowNode,
} from '@/components/screens/rainbow-document'
import { readFlowRoots } from '@/components/screens/rainbow-document'
import {
  isBottomSheetSlot,
  isRainbowTrigger,
} from '@/domain/triggers/rainbow-trigger'

export type FlowRelation = 'focus' | 'ancestor' | 'dim'

export type FlowCard = {
  id: string
  kind: 'screen' | 'plugin' | 'trigger' | 'event'
  title: string
  detail: string
  hostId: string
  triggerName: string
  path: string
  relation: FlowRelation
  x: number
  y: number
}

export type FlowLink = {
  id: string
  source: string
  target: string
  sourceHandle: 'out-bottom' | 'out-right'
  targetHandle: 'in-top' | 'in-left'
}

const PLUGIN_W = 210
const TRIGGER_W = 124
const EVENT_W = 200
const GAP_X = 88
const GAP_Y = 40
const CARD_H = 88

export function buildFlow(document: RainbowDocument, focus: string | null) {
  const cards: FlowCard[] = []
  const links: FlowLink[] = []
  const { screen, roots } = readFlowRoots(document)
  let y = 0

  if (screen) {
    pushCard(cards, {
      id: 'screen',
      kind: 'screen',
      title: nodeName(screen),
      detail: detailOf(screen),
      hostId: '',
      triggerName: '',
      path: 'screen',
      x: 0,
      y,
    })
    y = Math.max(
      y + CARD_H,
      placeBehavior(screen, 'screen', PLUGIN_W + GAP_X, y, cards, links),
    )
    y += GAP_Y
  }

  for (const [index, root] of roots.entries()) {
    if (isRainbowTrigger(nodeName(root)) || isBottomSheetSlot(nodeName(root)))
      continue
    const path = String(index)
    if (screen) {
      links.push({
        id: `screen-${path}`,
        source: 'screen',
        target: path,
        sourceHandle: 'out-bottom',
        targetHandle: 'in-top',
      })
    }
    y = placeHost(root, path, 0, y, cards, links, null) + GAP_Y
  }

  for (const card of cards) card.relation = relation(card.path, focus)
  return { cards, links }
}

function placeHost(
  node: RainbowNode,
  path: string,
  x: number,
  y: number,
  cards: FlowCard[],
  links: FlowLink[],
  parentId: string | null,
): number {
  const name = nodeName(node)
  pushCard(cards, {
    id: path,
    kind: 'plugin',
    title: name,
    detail: detailOf(node),
    hostId: path,
    triggerName: '',
    path,
    x,
    y,
  })
  if (parentId) {
    links.push({
      id: `${parentId}-${path}`,
      source: parentId,
      target: path,
      sourceHandle: 'out-bottom',
      targetHandle: 'in-top',
    })
  }
  const behaviorBottom = placeBehavior(
    node,
    path,
    x + PLUGIN_W + GAP_X,
    y,
    cards,
    links,
  )
  let cursor = Math.max(y + CARD_H, behaviorBottom)
  for (const [index, child] of (node.block?.children ?? []).entries()) {
    if (isRainbowTrigger(nodeName(child)) || isBottomSheetSlot(nodeName(child)))
      continue
    const childPath = `${path}/${index}`
    cursor += GAP_Y
    cursor = placeHost(child, childPath, x, cursor, cards, links, path)
  }
  return cursor
}

function placeBehavior(
  node: RainbowNode,
  path: string,
  x: number,
  y: number,
  cards: FlowCard[],
  links: FlowLink[],
): number {
  const names = triggerNames(node)
  if (names.length === 0) return y
  let cursor = y
  for (const triggerName of names) {
    const id = `${path}>${triggerName}`
    pushCard(cards, {
      id,
      kind: 'trigger',
      title: triggerName,
      detail: '',
      hostId: path,
      triggerName,
      path: id,
      x,
      y: cursor,
    })
    links.push({
      id: `${path}-${triggerName}`,
      source: path,
      target: id,
      sourceHandle: 'out-right',
      targetHandle: 'in-left',
    })
    const bottom = placeEvents(
      node,
      path,
      triggerName,
      x + TRIGGER_W + GAP_X,
      cursor,
      cards,
      links,
    )
    cursor = Math.max(cursor + CARD_H, bottom) + GAP_Y
  }
  return cursor - GAP_Y
}

function placeEvents(
  node: RainbowNode,
  path: string,
  triggerName: string,
  x: number,
  y: number,
  cards: FlowCard[],
  links: FlowLink[],
): number {
  const trigger = (node.events ?? []).find((item) => item.name.value === triggerName)
  const events = trigger?.events ?? []
  if (events.length === 0) return y
  let cursor = y
  for (const [index, event] of events.entries()) {
    const eventPath = `${path}>${triggerName}/${index}`
    pushCard(cards, {
      id: eventPath,
      kind: 'event',
      title: nodeName(event),
      detail: detailOf(event),
      hostId: eventPath,
      triggerName: '',
      path: eventPath,
      x,
      y: cursor,
    })
    links.push({
      id: `${path}>${triggerName}-${eventPath}`,
      source: `${path}>${triggerName}`,
      target: eventPath,
      sourceHandle: 'out-right',
      targetHandle: 'in-left',
    })
    const nested = placeBehavior(
      event,
      eventPath,
      x + EVENT_W + GAP_X,
      cursor,
      cards,
      links,
    )
    cursor = Math.max(cursor + CARD_H, nested) + GAP_Y
  }
  return cursor - GAP_Y
}

function triggerNames(node: RainbowNode) {
  const names: string[] = []
  for (const trigger of node.events ?? []) {
    const name = trigger.name.value
    if (!isRainbowTrigger(name) || names.includes(name)) continue
    names.push(name)
  }
  return names
}

function detailOf(node: RainbowNode) {
  const parameter = node.parameters.find((item) => item.value.kind === 'string')
  return parameter && parameter.value.kind === 'string'
    ? parameter.value.value
    : ''
}

function nodeName(node: RainbowNode) {
  return node.name.value
}

function relation(path: string, focus: string | null): FlowRelation {
  if (!focus) return 'ancestor'
  if (
    path === focus ||
    path.startsWith(`${focus}/`) ||
    path.startsWith(`${focus}>`)
  ) {
    return 'focus'
  }
  return 'ancestor'
}

function pushCard(cards: FlowCard[], card: Omit<FlowCard, 'relation'>) {
  cards.push({ ...card, relation: 'ancestor' })
}
