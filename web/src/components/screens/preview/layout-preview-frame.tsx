import type { CSSProperties } from 'react'

import { styleSpacing } from '@/components/screens/preview/plugin-chrome'
import { widthMode } from '@/components/screens/preview/plugin-layout'
import type {
  PreviewLayout,
  PreviewNode,
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

const trackClass: Record<PreviewLayout, string> = {
  vertical: 'w-full flex-col',
  horizontal: 'w-fit max-w-full flex-row',
  layer: 'grid w-full grid-cols-1',
  'vertical-scroll': 'w-full flex-col',
  'horizontal-scroll': 'w-max flex-row flex-nowrap',
}

export function LayoutPreview({
  definition,
  layout,
  badge,
  emptyLabel,
  sizing = 'fill',
  className,
  ...props
}: LayoutPreviewFrameProps) {
  return (
    <LayoutPreviewFrame
      definition={definition}
      layout={layout}
      badge={badge}
      emptyLabel={emptyLabel}
      sizing={sizing}
      className={className}
      {...props}
    />
  )
}

function LayoutPreviewFrame({
  layout,
  sizing = 'fill',
  nodes = [],
  renderNode,
  values,
  catalog = false,
  definition,
}: LayoutPreviewFrameProps) {
  const scrolling = layout === 'vertical-scroll' || layout === 'horizontal-scroll'
  const alignment = typeof values?.alignment === 'string' ? values.alignment : ''
  const layered = layout === 'layer'

  return (
    <div
      className={cn(
        'pointer-events-none bg-transparent',
        layout === 'horizontal' ? 'flex w-fit max-w-full' : 'flex w-full min-w-0 flex-col',
      )}
      style={frameHeight(catalog, scrolling, definition.size.height)}
      data-layout={layout}
    >
      <div
        className={cn(
          'min-h-0',
          layout === 'vertical-scroll' && 'scn-hide-scrollbar w-full flex-1 overflow-y-auto',
          layout === 'horizontal-scroll' && 'scn-hide-scrollbar w-full flex-1 overflow-x-auto',
          layered && 'w-full',
        )}
      >
        <div
          className={cn(layered ? '' : 'flex', trackClass[layout], crossAlign(layout, alignment))}
          style={{ gap: layered ? undefined : styleSpacing(values) }}
        >
          {nodes.map((node) => (
            <div
              key={node.id}
              className={childFrameClass(layout, alignment, node)}
              style={lineStyle(layout, alignment)}
            >
              {layout === 'vertical' || layout === 'vertical-scroll' ? (
                <div
                  className={
                    widthMode(node.componentId, node.props) === 'hug'
                      ? 'w-fit max-w-full'
                      : 'w-full min-w-0'
                  }
                >
                  {renderNode?.(node, sizing)}
                </div>
              ) : (
                renderNode?.(node, sizing)
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function crossAlign(layout: PreviewLayout, alignment: string) {
  const token = alignment.replace(/^\./, '')
  if (layout === 'layer') return ''
  if (layout === 'horizontal' || layout === 'horizontal-scroll') {
    if (!token) return 'items-start'
    if (token === 'bottom' || token.startsWith('bottom')) return 'items-end'
    if (token === 'center' || token === 'leading' || token === 'trailing') return 'items-center'
    return 'items-start'
  }
  return ''
}

function childFrameClass(layout: PreviewLayout, alignment: string, node: PreviewNode) {
  if (layout === 'layer') {
    const hug = widthMode(node.componentId, node.props) === 'hug'
    return cn('col-start-1 row-start-1 max-w-full', hug ? 'w-fit' : 'w-full', layerPlace(alignment))
  }
  if (layout === 'horizontal' || layout === 'horizontal-scroll') return 'w-fit shrink-0'
  return cn('flex w-full min-w-0', lineJustify(alignment))
}

function lineStyle(layout: PreviewLayout, alignment: string): CSSProperties | undefined {
  if (layout !== 'vertical' && layout !== 'vertical-scroll') return undefined
  const token = alignment.replace(/^\./, '')
  if (token === 'trailing' || token.endsWith('Trailing')) return { justifyContent: 'flex-end' }
  if (token === 'center' || token === 'top' || token === 'bottom') return { justifyContent: 'center' }
  return { justifyContent: 'flex-start' }
}

function lineJustify(alignment: string) {
  const token = alignment.replace(/^\./, '')
  if (token === 'trailing' || token.endsWith('Trailing')) return 'justify-end'
  if (token === 'center' || token === 'top' || token === 'bottom') return 'justify-center'
  return 'justify-start'
}

function layerPlace(alignment: string) {
  const token = alignment.replace(/^\./, '') || 'topLeading'
  const justify =
    token === 'top' || token === 'center' || token === 'bottom'
      ? 'justify-self-center'
      : token.endsWith('Trailing') || token === 'trailing'
        ? 'justify-self-end'
        : 'justify-self-start'
  const items =
    token.startsWith('bottom')
      ? 'self-end'
      : token === 'leading' || token === 'center' || token === 'trailing'
        ? 'self-center'
        : 'self-start'
  return `${justify} ${items}`
}

function frameHeight(catalog: boolean, scrolling: boolean, canvasHeight: number) {
  if (catalog) return { height: libraryFrameHeight }
  if (scrolling) return { height: canvasHeight }
  return undefined
}
