/* eslint-disable react-refresh/only-export-components */
import { PanelLeftCloseIcon, PanelRightCloseIcon } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'

import type { PreviewModule, PreviewNode, PreviewRenderProps } from './types'
import { ScnIconMark } from '@/scn/scn-icon'
import { cn } from '@/lib/utils'

const actionWidth = 88
const swipeDefinition = {
  id: 'swipe-actions',
  name: 'SwipeActions',
  description: 'Revela ações nas bordas de uma linha da lista.',
  icon: PanelRightCloseIcon,
  acceptsChildren: true,
  size: { width: 280, height: 72 },
} as const

const actionDefinition = {
  id: 'swipe-action',
  name: 'SwipeAction',
  description: 'Ação configurável de uma borda de SwipeActions.',
  icon: PanelLeftCloseIcon,
  size: { width: actionWidth, height: 64 },
} as const

const sampleActions: PreviewNode[] = [
  { id: 'leading', componentId: 'swipe-action', children: [], props: { title: 'Abrir', icon: 'eye', swipeSide: 'leading' } },
  { id: 'trailing', componentId: 'swipe-action', children: [], props: { title: 'Remover', icon: 'trash-2', variant: 'destructive', swipeSide: 'trailing' } },
]

type Drag = {
  pointer: number
  x: number
  y: number
  start: number
  started: boolean
}

function SwipeActionsPreview({ nodes = [], sizing = 'fill', renderNode, catalog }: PreviewRenderProps) {
  const actions = catalog ? sampleActions : nodes
  const leading = actions.filter((node) => node.props?.swipeSide === 'leading')
  const trailing = actions.filter((node) => node.props?.swipeSide === 'trailing')
  const content = nodes.filter((node) => node.componentId !== actionDefinition.id)
  const drag = useRef<Drag | null>(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState(0)

  const extent = (nodes: PreviewNode[], el: HTMLDivElement) =>
    Math.min(el.clientWidth, nodes.length * actionWidth)

  function move(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current
    if (!gesture || gesture.pointer !== event.pointerId) return
    const delta = event.clientX - gesture.x
    const vertical = event.clientY - gesture.y
    if (!gesture.started) {
      if (Math.max(Math.abs(delta), Math.abs(vertical)) < 8) return
      if (Math.abs(vertical) >= Math.abs(delta)) {
        drag.current = null
        return
      }
      gesture.started = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    setOffset(Math.max(-extent(trailing, event.currentTarget), Math.min(extent(leading, event.currentTarget), gesture.start + delta)))
  }

  function stop(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current
    if (!gesture || gesture.pointer !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (!gesture.started) return
    if (event.type !== 'pointerup') {
      setOffset(gesture.start)
      return
    }
    const width = extent(offset > 0 ? leading : trailing, event.currentTarget)
    setOffset(Math.abs(offset) > width / 3 ? Math.sign(offset) * width : 0)
  }

  const hasActions = leading.length > 0 || trailing.length > 0
  return (
    <div
      aria-label={hasActions ? 'Prévia das ações de deslizar' : undefined}
      data-swipe-preview=""
      tabIndex={hasActions ? 0 : undefined}
      className="nodrag nopan pointer-events-auto relative w-full min-w-0 touch-pan-y overflow-hidden rounded-lg select-none"
      onPointerDown={(event) => {
        if (!hasActions || !event.isPrimary || event.button !== 0) return
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, start: offset, started: false }
      }}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') setOffset(extent(leading, event.currentTarget))
        else if (event.key === 'ArrowLeft') setOffset(-extent(trailing, event.currentTarget))
        else if (event.key === 'Escape') setOffset(0)
        else return
        event.preventDefault()
      }}
    >
      <SwipeTray nodes={leading} side="leading" visible={offset > 0} />
      <SwipeTray nodes={trailing.reverse()} side="trailing" visible={offset < 0} />
      <div
        className={cn('relative w-full bg-[var(--scn-background)]', !dragging && 'motion-safe:transition-transform motion-safe:duration-200')}
        style={{ transform: `translateX(clamp(-100%, ${offset}px, 100%))` }}
      >
        {content.map((node) => <div key={node.id}>{renderNode?.(node, sizing)}</div>)}
        {catalog && content.length === 0 ? (
          <div className="rounded-lg border border-[var(--scn-border)] p-3 text-xs">Linha da lista</div>
        ) : null}
      </div>
    </div>
  )
}

function SwipeTray({ nodes, side, visible }: { nodes: PreviewNode[]; side: 'leading' | 'trailing'; visible: boolean }) {
  if (nodes.length === 0) return null
  return (
    <div
      aria-hidden={!visible}
      data-swipe-side={side}
      className={cn('absolute inset-y-0 flex max-w-full', side === 'leading' ? 'left-0' : 'right-0', !visible && 'invisible')}
      style={{ width: nodes.length * actionWidth }}
    >
      {nodes.map((node) => <SwipeActionPreview key={node.id} values={node.props} />)}
    </div>
  )
}

function SwipeActionPreview({ values }: PreviewRenderProps) {
  const title = typeof values?.title === 'string' ? values.title : 'Ação'
  const icon = typeof values?.icon === 'string' ? values.icon : ''
  const destructive = values?.variant === 'destructive'
  return (
    <span
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-1 text-center text-xs',
        destructive
          ? 'bg-[var(--scn-destructive)] text-white'
          : 'bg-[var(--scn-primary)] text-[var(--scn-primary-foreground)]',
      )}
    >
      {icon ? <ScnIconMark name={icon} size={18} /> : null}
      <span className="max-w-full break-words">{title}</span>
    </span>
  )
}

export const swipeActionsPreview: PreviewModule = { definition: swipeDefinition, Preview: SwipeActionsPreview }
export const swipeActionPreview: PreviewModule = { definition: actionDefinition, Preview: SwipeActionPreview }
