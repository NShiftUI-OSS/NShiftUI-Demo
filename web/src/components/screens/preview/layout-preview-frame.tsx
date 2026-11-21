import type { PointerEvent as ReactPointerEvent, DragEvent as ReactDragEvent } from 'react'

import { usePreviewAssist } from '@/components/phones/preview-display'
import { styleSpacing } from '@/components/screens/preview/plugin-chrome'
import type {
  PreviewLayout,
  PreviewRenderProps,
  ScreenComponentDefinition,
} from '@/components/screens/preview/types'
import { cn } from '@/lib/utils'

const libraryFrameHeight = 120

type LayoutPreviewFrameProps = PreviewRenderProps & {
  definition: ScreenComponentDefinition
  layout: PreviewLayout
  badge: string
  emptyLabel: string
}

const layoutClass: Record<PreviewLayout, string> = {
  vertical: 'w-full flex-col items-stretch',
  horizontal: 'w-full flex-row items-center',
  layer: 'relative min-h-28 w-full',
  'vertical-scroll': 'w-max min-w-full flex-col items-stretch',
  'horizontal-scroll': 'w-max flex-row flex-nowrap items-stretch',
}

export function LayoutPreview({
  definition,
  layout,
  badge,
  emptyLabel,
  ghost = false,
  position,
  className,
  sizing = 'fill',
  ...props
}: LayoutPreviewFrameProps) {
  if (ghost || position) {
    const Icon = definition.icon
    return (
      <div
        className={cn(
          'border-primary/70 bg-primary/10 text-foreground pointer-events-none flex w-max items-center gap-2 rounded-md border-2 border-dashed px-3 py-2 text-xs font-medium shadow-lg',
          className,
        )}
        style={
          position
            ? {
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 80,
                transform: 'translate(-50%, -50%)',
              }
            : undefined
        }
      >
        <Icon className="size-3.5 shrink-0" />
        {definition.name}
        <span className="text-primary/80 text-[10px]">{badge}</span>
      </div>
    )
  }

  return (
    <LayoutPreviewFrame
      definition={definition}
      layout={layout}
      badge={badge}
      emptyLabel={emptyLabel}
      sizing={sizing}
      {...props}
    />
  )
}

function LayoutPreviewFrame({
  definition,
  layout,
  badge,
  emptyLabel,
  sizing = 'fill',
  nodes = [],
  renderNode,
  dropTargetId,
  values,
  catalog = false,
  isDropTarget = false,
  onDragOver,
  onDrop,
  onPointerDown,
  draggable = true,
  onDragStart,
  onDragEnd,
}: LayoutPreviewFrameProps) {
  const assist = usePreviewAssist(catalog)
  const Icon = definition.icon
  const scrolling = layout === 'vertical-scroll' || layout === 'horizontal-scroll'
  const childSizing = scrolling ? 'intrinsic' : sizing
  const childrenClass =
    layout === 'horizontal' && childSizing === 'intrinsic'
      ? 'w-max flex-row flex-nowrap items-stretch'
      : layoutClass[layout]

  return (
    <div
      className={cn(
        'flex flex-col bg-transparent',
        assist && 'border-primary/70 cursor-grab border-2 border-dashed active:cursor-grabbing',
        sizing === 'intrinsic' && !scrolling ? 'w-max' : 'w-full',
        assist && isDropTarget && 'ring-primary ring-2 ring-inset',
      )}
      style={frameHeight(catalog, scrolling, definition.size.height)}
      data-layout={layout}
      data-layout-node={dropTargetId}
      data-drop-target
      data-drop-target-id={dropTargetId}
      draggable={assist && draggable}
      onPointerDown={(event) => {
        if (!ownsFrame(event)) return
        onPointerDown?.(event)
      }}
      onDragStart={(event) => {
        if (!ownsFrame(event)) return
        onDragStart?.(event)
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {assist ? (
        <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-medium text-neutral-400">
          <Icon className="size-3.5" />
          {definition.name}
          <span className="text-primary/70 ml-auto text-[9px]">{badge}</span>
        </div>
      ) : null}
      <div
        className={cn(
          'min-h-0',
          layout === 'vertical-scroll' && 'flex-1 overflow-y-auto',
          layout === 'horizontal-scroll' && 'flex-1 overflow-x-auto',
        )}
      >
        <div className={cn('flex', childrenClass)} style={{ gap: styleSpacing(values) }}>
          {nodes.length === 0 ? (
            assist ? (
            <span className="w-full py-4 text-center text-[10px] text-neutral-500">
              {emptyLabel}
            </span>
          ) : null
          ) : (
            nodes.map((node) => (
              <div
                key={node.id}
                className={childFrameClass(layout, childSizing)}
                style={
                  layout === 'horizontal' && childSizing === 'fill'
                    ? { width: `${100 / nodes.length}%` }
                    : undefined
                }
              >
                {renderNode?.(node, childSizing)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function frameHeight(catalog: boolean, scrolling: boolean, canvasHeight: number) {
  if (catalog) return { height: libraryFrameHeight }
  if (scrolling) return { height: canvasHeight }
  return undefined
}

function ownsFrame(event: ReactPointerEvent<HTMLElement> | ReactDragEvent<HTMLElement>) {
  const owner = (event.target as HTMLElement).closest('[data-layout-node]')
  return !owner || owner === event.currentTarget
}

function childFrameClass(layout: PreviewLayout, sizing: 'fill' | 'intrinsic') {
  if (layout === 'layer') return 'absolute inset-0 w-full'
  if (layout === 'horizontal' && sizing === 'fill') return 'min-w-0 shrink-0'
  if (sizing === 'intrinsic') return 'w-max shrink-0'
  return 'w-full min-w-0'
}
