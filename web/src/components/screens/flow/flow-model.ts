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

const PLUGIN_W = 220
const SCREEN_W = 220
const TRIGGER_W = 132
const EVENT_W = 210
const SIBLING_GAP = 64
const LEVEL_GAP = 84
const BEHAVIOR_GAP = 48
const GAP_Y = 28
const CARD_H = 76

type Branch = {
  node: RainbowNode
  path: string
  cardW: number
  subtreeW: number
  subtreeH: number
  behaviorW: number
  behaviorH: number
  contentW: number
  children: Branch[]
}

export function buildFlow(document: RainbowDocument, focus: string | null) {
  const cards: FlowCard[] = []
  const links: FlowLink[] = []
  const { screen, roots } = readFlowRoots(document)
  const children = roots
    .map((node, index) => ({ node, index }))
    .filter(
      ({ node }) =>
        !isRainbowTrigger(nodeName(node)) && !isBottomSheetSlot(nodeName(node)),
    )
    .map(({ node, index }) => measureBranch(node, String(index), PLUGIN_W))

  if (screen) {
    const screenBehavior = behaviorSize(screen)
    const row = rowWidth(children)
    const contentW = Math.max(SCREEN_W, row)
    const cardX = (contentW - SCREEN_W) / 2
    pushCard(cards, {
      id: 'screen',
      kind: 'screen',
      title: nodeName(screen),
      detail: detailOf(screen),
      hostId: '',
      triggerName: '',
      path: 'screen',
      x: Math.max(0, cardX),
      y: 0,
    })
    placeBehavior(
      screen,
      'screen',
      Math.max(0, cardX) + SCREEN_W + BEHAVIOR_GAP,
      0,
      cards,
      links,
    )
    const childY = Math.max(CARD_H, screenBehavior.h) + LEVEL_GAP
    placeRow(children, (contentW - row) / 2, childY, 'screen', cards, links)
  } else {
    placeRow(children, 0, 0, null, cards, links)
  }

  for (const card of cards) card.relation = relation(card.path, focus)
  return { cards, links }
}

function measureBranch(node: RainbowNode, path: string, cardW: number): Branch {
  const children = visibleChildren(node).map((child) =>
    measureBranch(child.node, `${path}/${child.index}`, PLUGIN_W),
  )
  const behavior = behaviorSize(node)
  const row = rowWidth(children)
  const contentW = Math.max(cardW, row)
  const trunk = Math.max(CARD_H, behavior.h)
  return {
    node,
    path,
    cardW,
    subtreeW: contentW + (behavior.w ? BEHAVIOR_GAP + behavior.w : 0),
    subtreeH: trunk + (children.length ? LEVEL_GAP + tallest(children) : 0),
    behaviorW: behavior.w,
    behaviorH: behavior.h,
    contentW,
    children,
  }
}

function placeRow(
  branches: Branch[],
  x: number,
  y: number,
  parentId: string | null,
  cards: FlowCard[],
  links: FlowLink[],
) {
  let cursor = x
  for (const branch of branches) {
    placeBranch(branch, cursor, y, parentId, cards, links)
    cursor += branch.subtreeW + SIBLING_GAP
  }
}

function placeBranch(
  branch: Branch,
  x: number,
  y: number,
  parentId: string | null,
  cards: FlowCard[],
  links: FlowLink[],
) {
  const row = rowWidth(branch.children)
  const cardX = x + (branch.contentW - branch.cardW) / 2
  const childX = x + (branch.contentW - row) / 2
  pushCard(cards, {
    id: branch.path,
    kind: 'plugin',
    title: nodeName(branch.node),
    detail: detailOf(branch.node),
    hostId: branch.path,
    triggerName: '',
    path: branch.path,
    x: cardX,
    y,
  })
  if (parentId) {
    links.push({
      id: `${parentId}-${branch.path}`,
      source: parentId,
      target: branch.path,
      sourceHandle: 'out-bottom',
      targetHandle: 'in-top',
    })
  }
  placeBehavior(
    branch.node,
    branch.path,
    cardX + branch.cardW + BEHAVIOR_GAP,
    y,
    cards,
    links,
  )
  if (branch.children.length === 0) return
  placeRow(
    branch.children,
    childX,
    y + Math.max(CARD_H, branch.behaviorH) + LEVEL_GAP,
    branch.path,
    cards,
    links,
  )
}

function rowWidth(branches: Branch[]) {
  return branches.reduce(
    (sum, branch, index) => sum + branch.subtreeW + (index ? SIBLING_GAP : 0),
    0,
  )
}

function tallest(branches: Branch[]) {
  return branches.reduce((max, branch) => Math.max(max, branch.subtreeH), 0)
}

function visibleChildren(node: RainbowNode) {
  return (node.block?.children ?? [])
    .map((child, index) => ({ node: child, index }))
    .filter(
      ({ node: child }) =>
        !isRainbowTrigger(nodeName(child)) && !isBottomSheetSlot(nodeName(child)),
    )
}

function behaviorSize(node: RainbowNode) {
  const names = triggerNames(node)
  if (names.length === 0) return { w: 0, h: 0 }
  let width = 0
  let height = 0
  for (const triggerName of names) {
    const events =
      (node.events ?? []).find((item) => item.name.value === triggerName)?.events ??
      []
    let eventsW = 0
    let eventsH = 0
    for (const event of events) {
      const nested = behaviorSize(event)
      eventsW = Math.max(
        eventsW,
        EVENT_W + (nested.w ? BEHAVIOR_GAP + nested.w : 0),
      )
      eventsH += Math.max(CARD_H, nested.h) + GAP_Y
    }
    if (events.length > 0) eventsH -= GAP_Y
    width = Math.max(width, TRIGGER_W + (events.length ? BEHAVIOR_GAP + eventsW : 0))
    height += Math.max(CARD_H, eventsH) + GAP_Y
  }
  return { w: width, h: height - GAP_Y }
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
      x + TRIGGER_W + BEHAVIOR_GAP,
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
      x + EVENT_W + BEHAVIOR_GAP,
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
