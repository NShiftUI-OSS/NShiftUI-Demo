export const MERGE_OURS = '<<<<<<< Sua alteração'
export const MERGE_SEPARATOR = '======='

export function mergeTheirs(revision: number) {
  return `>>>>>>> Revisão ${revision}`
}

export function hasMergeMarkers(source: string) {
  return source.includes(MERGE_OURS)
}

export type RainbowMerge = {
  text: string
  conflicts: number
}

type Edit = {
  start: number
  end: number
  lines: string[]
}

export function mergeRainbow(
  base: string,
  ours: string,
  theirs: string,
  theirRevision: number,
): RainbowMerge {
  if (ours === theirs) return { text: ours, conflicts: 0 }
  if (ours === base) return { text: theirs, conflicts: 0 }
  if (theirs === base) return { text: ours, conflicts: 0 }

  const baseLines = splitLines(base)
  const ourEdits = edits(baseLines, splitLines(ours))
  const theirEdits = edits(baseLines, splitLines(theirs))
  const merged = mergeEdits(baseLines, ourEdits, theirEdits, theirRevision)
  const trailing = base.endsWith('\n') || ours.endsWith('\n') || theirs.endsWith('\n')
  return { text: joinLines(merged.lines, trailing), conflicts: merged.conflicts }
}

function mergeEdits(
  base: string[],
  ourEdits: Edit[],
  theirEdits: Edit[],
  theirRevision: number,
) {
  const lines: string[] = []
  let conflicts = 0
  let index = 0
  let i = 0
  let j = 0

  while (i < ourEdits.length || j < theirEdits.length) {
    const left = ourEdits[i]
    const right = theirEdits[j]

    if (left && right && sameEdit(left, right)) {
      lines.push(...base.slice(index, left.start), ...left.lines)
      index = left.end
      i += 1
      j += 1
      continue
    }

    if (left && right && overlaps(left, right)) {
      const block = consumeOverlap(ourEdits, theirEdits, i, j)
      lines.push(...base.slice(index, block.start))
      lines.push(
        MERGE_OURS,
        ...sliceSide(base, ourEdits, block.start, block.end, i, block.nextI),
        MERGE_SEPARATOR,
        ...sliceSide(base, theirEdits, block.start, block.end, j, block.nextJ),
        mergeTheirs(theirRevision),
      )
      conflicts += 1
      index = block.end
      i = block.nextI
      j = block.nextJ
      continue
    }

    const edit = !right || (left && left.start < right.start) ? left : right
    lines.push(...base.slice(index, edit.start), ...edit.lines)
    index = edit.end
    if (edit === left) i += 1
    else j += 1
  }

  lines.push(...base.slice(index))
  return { lines, conflicts }
}

function consumeOverlap(ours: Edit[], theirs: Edit[], i: number, j: number) {
  let end = Math.max(ours[i].end, theirs[j].end)
  let nextI = i + 1
  let nextJ = j + 1
  let moved = true
  while (moved) {
    moved = false
    if (nextI < ours.length && ours[nextI].start < end) {
      end = Math.max(end, ours[nextI].end)
      nextI += 1
      moved = true
    }
    if (nextJ < theirs.length && theirs[nextJ].start < end) {
      end = Math.max(end, theirs[nextJ].end)
      nextJ += 1
      moved = true
    }
  }
  return {
    start: Math.min(ours[i].start, theirs[j].start),
    end,
    nextI,
    nextJ,
  }
}

function sliceSide(
  base: string[],
  edits: Edit[],
  from: number,
  to: number,
  start: number,
  end: number,
) {
  const lines: string[] = []
  let cursor = from
  for (let index = start; index < end; index += 1) {
    const edit = edits[index]
    if (edit.start > cursor) lines.push(...base.slice(cursor, edit.start))
    lines.push(...edit.lines)
    cursor = edit.end
  }
  if (cursor < to) lines.push(...base.slice(cursor, to))
  return lines
}

function overlaps(left: Edit, right: Edit) {
  if (left.start === right.start) return true
  return left.start < right.end && right.start < left.end
}

function sameEdit(left: Edit, right: Edit) {
  return (
    left.start === right.start &&
    left.end === right.end &&
    left.lines.length === right.lines.length &&
    left.lines.every((line, index) => line === right.lines[index])
  )
}

function edits(base: string[], next: string[]): Edit[] {
  const table = lcsTable(base, next)
  const steps: Array<{ base: string | null; next: string | null }> = []
  let i = base.length
  let j = next.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && base[i - 1] === next[j - 1]) {
      steps.push({ base: base[i - 1], next: next[j - 1] })
      i -= 1
      j -= 1
    } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
      steps.push({ base: null, next: next[j - 1] })
      j -= 1
    } else {
      steps.push({ base: base[i - 1], next: null })
      i -= 1
    }
  }
  steps.reverse()

  const result: Edit[] = []
  let baseIndex = 0
  let step = 0
  while (step < steps.length) {
    if (steps[step].base !== null && steps[step].next !== null) {
      baseIndex += 1
      step += 1
      continue
    }
    const start = baseIndex
    const lines: string[] = []
    while (step < steps.length && (steps[step].base === null || steps[step].next === null)) {
      if (steps[step].base !== null) baseIndex += 1
      if (steps[step].next !== null) lines.push(steps[step].next ?? '')
      step += 1
    }
    result.push({ start, end: baseIndex, lines })
  }
  return result
}

function lcsTable(base: string[], next: string[]) {
  const table = Array.from({ length: base.length + 1 }, () =>
    new Array<number>(next.length + 1).fill(0),
  )
  for (let i = 1; i <= base.length; i += 1) {
    for (let j = 1; j <= next.length; j += 1) {
      table[i][j] =
        base[i - 1] === next[j - 1]
          ? table[i - 1][j - 1] + 1
          : Math.max(table[i - 1][j], table[i][j - 1])
    }
  }
  return table
}

function splitLines(value: string) {
  if (value.length === 0) return []
  const lines = value.split('\n')
  if (value.endsWith('\n')) lines.pop()
  return lines
}

function joinLines(lines: string[], trailingNewline: boolean) {
  const text = lines.join('\n')
  if (text.length === 0) return trailingNewline ? '\n' : ''
  return trailingNewline ? `${text}\n` : text
}
