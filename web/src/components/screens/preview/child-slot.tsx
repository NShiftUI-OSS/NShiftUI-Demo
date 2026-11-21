import type { DragEventHandler, ReactNode } from 'react'

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
  sample,
}: ChildSlotProps) {
  const placed = Boolean(dropTargetId)

  return (
    <div className={cn(className)}>
      {nodes.length > 0 ? (
        nodes.map((node) => (
          <div key={node.id} className="flex w-full min-w-0 justify-start">
            {renderNode?.(node, sizing)}
          </div>
        ))
      ) : placed ? null : (
        sample
      )}
    </div>
  )
}
