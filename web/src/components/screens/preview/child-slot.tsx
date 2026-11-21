import type { DragEventHandler, ReactNode } from 'react'

import { usePreviewAssist } from '@/components/phones/preview-display'
import type {
  PreviewNode,
  PreviewSizing,
} from '@/components/screens/preview/types'
import { cn } from '@/lib/utils'

type ChildSlotProps = {
  className?: string
  nodes?: PreviewNode[]
  renderNode?: (node: PreviewNode, sizing: PreviewSizing) => ReactNode
  sizing?: PreviewSizing
  dropTargetId?: string
  isDropTarget?: boolean
  onDragOver?: DragEventHandler<HTMLDivElement>
  onDrop?: DragEventHandler<HTMLDivElement>
  sample: ReactNode
  emptyLabel?: string
}

export function ChildSlot({
  className,
  nodes = [],
  renderNode,
  sizing = 'fill',
  dropTargetId,
  isDropTarget = false,
  onDragOver,
  onDrop,
  sample,
  emptyLabel = 'Solte componentes aqui',
}: ChildSlotProps) {
  const placed = Boolean(dropTargetId)
  const assist = usePreviewAssist()

  return (
    <div
      className={cn(className)}
      data-drop={placed && isDropTarget ? 'true' : undefined}
      data-drop-target={placed ? '' : undefined}
      data-drop-target-id={placed ? dropTargetId : undefined}
      onDragOver={placed ? onDragOver : undefined}
      onDrop={placed ? onDrop : undefined}
    >
      {nodes.length > 0 ? (
        nodes.map((node) => (
          <div key={node.id} className="w-full min-w-0">
            {renderNode?.(node, sizing)}
          </div>
        ))
      ) : placed ? (
        assist ? (
          <span className="scn-text w-full py-2 text-center" data-color="muted" data-style="xs">
            {emptyLabel}
          </span>
        ) : null
      ) : (
        sample
      )}
    </div>
  )
}
