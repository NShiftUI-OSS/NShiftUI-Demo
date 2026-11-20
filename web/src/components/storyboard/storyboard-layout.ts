export type LayoutPoint = { x: number; y: number }

export type LayoutScreen = { id: string; name: string; isRoot: boolean }

export type LayoutEdge = { id: string; source: string; target: string }

export type ScreenPlacement = {
  id: string
  x: number
  y: number
  rank: number
}

export type RoutedEdge = {
  id: string
  points: LayoutPoint[]
  labelX: number
  labelY: number
}

export type LayoutAudit = {
  crossings: number
  phoneHits: number
  unrouted: number
}

type Rect = { x: number; y: number; w: number; h: number }

type Side = 'top' | 'bottom'

type CorridorEdge = {
  edge: LayoutEdge
  side: Side
  lane: number
  track: number
}

const LANE = 28
const CLEAR = 36
const COL_GAP = 200
const ROW_GAP = 168

export function layoutStoryboard(
  screens: LayoutScreen[],
  edges: LayoutEdge[],
  phoneWidth: number,
  phoneHeight: number,
  labelHeight: number,
): { placements: ScreenPlacement[]; routes: RoutedEdge[]; audit: LayoutAudit } {
  const nodeWidth = Math.max(1, Math.round(phoneWidth))
  const nodeHeight = Math.max(1, Math.round(phoneHeight + labelHeight))
  const phoneBody = Math.max(1, Math.round(phoneHeight))
  const placements = placeScreens(screens, edges, nodeWidth, nodeHeight)
  const obstacles = placements.map((node) => ({
    x: node.x,
    y: node.y,
    w: nodeWidth,
    h: nodeHeight,
  }))
  const phones = placements.map((node) => ({
    x: node.x,
    y: node.y,
    w: nodeWidth,
    h: phoneBody,
  }))
  const routes = routeEdges(placements, edges, obstacles, nodeWidth, nodeHeight, phoneBody)
  const audit = auditRoutes(routes, phones, [])
  return { placements, routes, audit }
}

function rankScreens(screens: LayoutScreen[], edges: LayoutEdge[]) {
  const outgoing = new Map<string, LayoutEdge[]>()
  for (const screen of screens) outgoing.set(screen.id, [])
  for (const edge of edges) outgoing.get(edge.source)?.push(edge)

  const color = new Map<string, 'w' | 'g' | 'b'>()
  for (const screen of screens) color.set(screen.id, 'w')
  const back = new Set<string>()
  const visit = (id: string) => {
    color.set(id, 'g')
    for (const edge of outgoing.get(id) ?? []) {
      const tone = color.get(edge.target) ?? 'w'
      if (tone === 'g') back.add(edge.id)
      else if (tone === 'w') visit(edge.target)
    }
    color.set(id, 'b')
  }

  const roots = screens.filter((screen) => screen.isRoot).map((screen) => screen.id)
  const seeds = roots.length > 0 ? roots : screens.slice(0, 1).map((screen) => screen.id)
  for (const id of seeds) if (color.get(id) === 'w') visit(id)
  for (const screen of screens) if (color.get(screen.id) === 'w') visit(screen.id)

  const rank = new Map<string, number>()
  for (const id of seeds) rank.set(id, 0)
  for (let pass = 0; pass < screens.length; pass += 1) {
    let changed = false
    for (const edge of edges) {
      if (back.has(edge.id)) continue
      const sourceRank = rank.get(edge.source)
      if (sourceRank === undefined) continue
      const next = sourceRank + 1
      const current = rank.get(edge.target)
      if (current === undefined || current < next) {
        rank.set(edge.target, next)
        changed = true
      }
    }
    if (!changed) break
  }
  let maxRank = 0
  for (const value of rank.values()) maxRank = Math.max(maxRank, value)
  const loose = maxRank + 1
  for (const screen of screens) if (!rank.has(screen.id)) rank.set(screen.id, loose)
  return rank
}

function placeScreens(
  screens: LayoutScreen[],
  edges: LayoutEdge[],
  nodeWidth: number,
  nodeHeight: number,
): ScreenPlacement[] {
  const rank = rankScreens(screens, edges)
  const degree = new Map<string, number>()
  for (const screen of screens) degree.set(screen.id, 0)
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
  }
  const column = screens
    .filter((screen) => screen.isRoot || (degree.get(screen.id) ?? 0) > 0)
    .sort((left, right) => {
      const delta = (rank.get(left.id) ?? 0) - (rank.get(right.id) ?? 0)
      if (delta !== 0) return delta
      return left.name.localeCompare(right.name)
    })
  const loose = screens
    .filter((screen) => !screen.isRoot && (degree.get(screen.id) ?? 0) === 0)
    .sort((left, right) => left.name.localeCompare(right.name))

  let topLanes = 0
  let bottomLanes = 0
  for (const edge of edges) {
    const source = column.findIndex((screen) => screen.id === edge.source)
    const target = column.findIndex((screen) => screen.id === edge.target)
    if (source < 0 || target < 0 || source === target) continue
    if (Math.abs(source - target) === 1) continue
    if (target > source && (rank.get(edge.source) ?? -1) === 0) topLanes += 1
    else bottomLanes += 1
  }
  const y = CLEAR + Math.max(topLanes, 1) * LANE + CLEAR
  let x = CLEAR
  const placements: ScreenPlacement[] = column.map((screen) => {
    const placed = {
      id: screen.id,
      x,
      y,
      rank: rank.get(screen.id) ?? 0,
    }
    x += nodeWidth + COL_GAP
    return placed
  })
  if (loose.length > 0) {
    const rowY = y + nodeHeight + ROW_GAP
    loose.forEach((screen, index) => {
      placements.push({
        id: screen.id,
        x: CLEAR + index * (nodeWidth + COL_GAP),
        y: rowY,
        rank: (rank.get(screen.id) ?? 0) + 1,
      })
    })
  }
  return placements
}

function routeEdges(
  placements: ScreenPlacement[],
  edges: LayoutEdge[],
  obstacles: Rect[],
  nodeWidth: number,
  nodeHeight: number,
  phoneBody: number,
) {
  const byId = new Map(placements.map((node) => [node.id, node]))
  const chainY = Math.min(...placements.map((node) => node.y))
  const chain = placements
    .filter((node) => node.y === chainY)
    .sort((left, right) => left.x - right.x)
  const indexOf = new Map(chain.map((node, index) => [node.id, index]))
  const adjacentGroups = new Map<string, LayoutEdge[]>()
  const topBySource = new Map<string, LayoutEdge[]>()
  const bottomEdges: LayoutEdge[] = []

  for (const edge of edges) {
    const sourceIndex = indexOf.get(edge.source)
    const targetIndex = indexOf.get(edge.target)
    if (sourceIndex === undefined || targetIndex === undefined || edge.source === edge.target) {
      continue
    }
    if (Math.abs(sourceIndex - targetIndex) === 1) {
      const key = `${Math.min(sourceIndex, targetIndex)}:${Math.max(sourceIndex, targetIndex)}`
      const group = adjacentGroups.get(key) ?? []
      group.push(edge)
      adjacentGroups.set(key, group)
      continue
    }
    const forwardFromRoot = targetIndex > sourceIndex && (byId.get(edge.source)?.rank ?? -1) === 0
    if (forwardFromRoot) {
      const group = topBySource.get(edge.source) ?? []
      group.push(edge)
      topBySource.set(edge.source, group)
      continue
    }
    bottomEdges.push(edge)
  }

  const topEdges = [...topBySource.values()].flat()
  const corridors = [
    ...corridorsFor(topEdges, 'top', byId, chainY, nodeHeight),
    ...corridorsFor(bottomEdges, 'bottom', byId, chainY, nodeHeight),
  ]
  const routed: RoutedEdge[] = []

  for (const group of adjacentGroups.values()) {
    group.forEach((edge, index) => {
      const source = byId.get(edge.source)
      const target = byId.get(edge.target)
      if (!source || !target) return
      const offset = Math.round((index - (group.length - 1) / 2) * 18)
      const y = source.y + Math.round(phoneBody / 2) + offset
      const forward = source.x < target.x
      const points = forward
        ? [
            { x: source.x + nodeWidth, y },
            { x: target.x, y },
          ]
        : [
            { x: source.x, y },
            { x: target.x + nodeWidth, y },
          ]
      routed.push({ id: edge.id, points, ...labelAnchor(points, obstacles) })
    })
  }

  for (const item of corridors) {
    const source = byId.get(item.edge.source)
    const target = byId.get(item.edge.target)
    if (!source || !target) continue
    const sameSide = corridors.filter((other) => other.side === item.side)
    const left = source.x <= target.x ? source : target
    const right = source.x <= target.x ? target : source
    const x1 = corridorPort(left, item.lane, sameSide.length, nodeWidth, 'leave')
    const x2 = corridorPort(right, item.lane, sameSide.length, nodeWidth, 'enter')
    const y1 = item.side === 'top' ? left.y : left.y + nodeHeight
    const y2 = item.side === 'top' ? right.y : right.y + nodeHeight
    const points = [
      { x: x1, y: y1 },
      { x: x1, y: item.track },
      { x: x2, y: item.track },
      { x: x2, y: y2 },
    ]
    routed.push({ id: item.edge.id, points: simplify(points), ...labelAnchor(points, obstacles) })
  }

  return routed
}

function corridorsFor(
  edges: LayoutEdge[],
  side: Side,
  byId: Map<string, ScreenPlacement>,
  chainY: number,
  nodeHeight: number,
): CorridorEdge[] {
  const ordered = [...edges].sort((left, right) => {
    const span = spanOf(right, byId) - spanOf(left, byId)
    return span || left.id.localeCompare(right.id)
  })
  return ordered.map((edge, index) => {
    const lane = ordered.length - 1 - index
    const track =
      side === 'top'
        ? chainY - CLEAR - lane * LANE
        : chainY + nodeHeight + CLEAR + lane * LANE
    return { edge, side, lane, track }
  })
}

function corridorPort(
  node: ScreenPlacement,
  lane: number,
  laneCount: number,
  nodeWidth: number,
  role: 'leave' | 'enter',
) {
  const inset = Math.min(28, Math.round(nodeWidth / 8))
  const outer = laneCount <= 1 ? 0.5 : lane / (laneCount - 1)
  const half = nodeWidth / 2 - inset
  if (role === 'leave') {
    return Math.round(node.x + nodeWidth / 2 + (1 - outer) * half)
  }
  return Math.round(node.x + inset + outer * half)
}

function spanOf(edge: LayoutEdge, byId: Map<string, ScreenPlacement>) {
  const source = byId.get(edge.source)
  const target = byId.get(edge.target)
  if (!source || !target) return 0
  return Math.abs(source.x - target.x)
}

function labelAnchor(points: LayoutPoint[], obstacles: Rect[]) {
  let bestX = points[0]?.x ?? 0
  let bestY = points[0]?.y ?? 0
  let bestScore = -1
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index]
    const to = points[index + 1]
    const length = Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
    if (length < 36) continue
    const horizontal = from.y === to.y
    const midX = Math.round((from.x + to.x) / 2)
    const midY = Math.round((from.y + to.y) / 2)
    const shifts = horizontal
      ? [
          { x: midX, y: midY - 18 },
          { x: midX, y: midY + 18 },
        ]
      : [
          { x: midX + 20, y: midY },
          { x: midX - 20, y: midY },
        ]
    for (const shift of shifts) {
      const box = { x: shift.x - 58, y: shift.y - 14, w: 116, h: 28 }
      if (obstacles.some((obstacle) => rectsOverlap(box, expandRect(obstacle, 8)))) continue
      if (length > bestScore) {
        bestScore = length
        bestX = shift.x
        bestY = shift.y
      }
    }
  }
  return { labelX: bestX, labelY: bestY }
}

function auditRoutes(routes: RoutedEdge[], phones: Rect[], unrouted: string[]): LayoutAudit {
  const segments: { a: LayoutPoint; b: LayoutPoint }[] = []
  for (const route of routes) {
    for (let index = 0; index < route.points.length - 1; index += 1) {
      segments.push({ a: route.points[index], b: route.points[index + 1] })
    }
  }
  let phoneHits = 0
  for (const segment of segments) {
    for (const phone of phones) {
      if (segmentEnters(segment.a, segment.b, phone)) phoneHits += 1
    }
  }
  let crossings = 0
  for (let left = 0; left < segments.length; left += 1) {
    for (let right = left + 1; right < segments.length; right += 1) {
      if (segmentsConflict(segments[left].a, segments[left].b, segments[right].a, segments[right].b)) {
        crossings += 1
      }
    }
  }
  for (let left = 0; left < routes.length; left += 1) {
    const seen = new Set(routes[left].points.map((point) => keyOf(point.x, point.y)))
    for (let right = left + 1; right < routes.length; right += 1) {
      for (const point of routes[right].points) {
        if (!seen.has(keyOf(point.x, point.y))) continue
        if (onBoundary(point, phones)) continue
        crossings += 1
      }
    }
  }
  return { crossings, phoneHits, unrouted: unrouted.length }
}

function segmentEnters(a: LayoutPoint, b: LayoutPoint, rect: Rect) {
  if (a.x !== b.x && a.y !== b.y) return true
  if (a.x === b.x) {
    if (a.x <= rect.x || a.x >= rect.x + rect.w) return false
    return overlapPastEndpoint(a.y, b.y, rect.y, rect.y + rect.h)
  }
  if (a.y <= rect.y || a.y >= rect.y + rect.h) return false
  return overlapPastEndpoint(a.x, b.x, rect.x, rect.x + rect.w)
}

function overlapPastEndpoint(a1: number, a2: number, b1: number, b2: number) {
  const start = Math.max(Math.min(a1, a2), Math.min(b1, b2))
  const end = Math.min(Math.max(a1, a2), Math.max(b1, b2))
  if (end < start - 0.01) return false
  if (end - start > 0.5) return true
  const atEndpoint = Math.abs(start - a1) <= 0.5 || Math.abs(start - a2) <= 0.5
  return !atEndpoint
}

function segmentsConflict(a: LayoutPoint, b: LayoutPoint, c: LayoutPoint, d: LayoutPoint) {
  const aVert = a.x === b.x
  const cVert = c.x === d.x
  if (aVert && cVert) {
    if (a.x !== c.x) return false
    return overlapLength(a.y, b.y, c.y, d.y) > 0.5
  }
  if (!aVert && !cVert) {
    if (a.y !== c.y) return false
    return overlapLength(a.x, b.x, c.x, d.x) > 0.5
  }
  const vertical = aVert ? [a, b] : [c, d]
  const horizontal = aVert ? [c, d] : [a, b]
  const x = vertical[0].x
  const y = horizontal[0].y
  const y1 = Math.min(vertical[0].y, vertical[1].y)
  const y2 = Math.max(vertical[0].y, vertical[1].y)
  const x1 = Math.min(horizontal[0].x, horizontal[1].x)
  const x2 = Math.max(horizontal[0].x, horizontal[1].x)
  const insideX = x > x1 + 0.5 && x < x2 - 0.5
  const insideY = y > y1 + 0.5 && y < y2 - 0.5
  if (!(insideX && insideY)) return false
  return true
}

function overlapLength(a1: number, a2: number, b1: number, b2: number) {
  return Math.min(Math.max(a1, a2), Math.max(b1, b2)) - Math.max(Math.min(a1, a2), Math.min(b1, b2))
}

function onBoundary(point: LayoutPoint, rects: Rect[]) {
  return rects.some((rect) => {
    const verticalSide = point.x === rect.x || point.x === rect.x + rect.w
    const horizontalSide = point.y === rect.y || point.y === rect.y + rect.h
    const withinX = point.x >= rect.x && point.x <= rect.x + rect.w
    const withinY = point.y >= rect.y && point.y <= rect.y + rect.h
    return (verticalSide && withinY) || (horizontalSide && withinX)
  })
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function expandRect(rect: Rect, pad: number): Rect {
  return { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }
}

function simplify(points: LayoutPoint[]) {
  if (points.length <= 2) return points
  const simplified = [points[0]]
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1]
    const current = points[index]
    const next = points[index + 1]
    const sameLine =
      (previous.x === current.x && current.x === next.x) ||
      (previous.y === current.y && current.y === next.y)
    if (!sameLine) simplified.push(current)
  }
  simplified.push(points[points.length - 1])
  return simplified
}

function keyOf(x: number, y: number) {
  return `${x},${y}`
}
