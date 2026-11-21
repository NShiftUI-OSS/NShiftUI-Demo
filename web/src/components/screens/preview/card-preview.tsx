/* eslint-disable react-refresh/only-export-components */
import { SquareIcon } from 'lucide-react'

import { ChildSlot } from '@/components/screens/preview/child-slot'
import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnText } from '@/scn/widgets'

const definition = {
  id: 'card',
  name: 'Card',
  description: 'Superfície com conteúdo',
  icon: SquareIcon,
  acceptsChildren: true,
  size: { width: 280, height: 110 },
} as const

export function CardPreview({
  nodes,
  renderNode,
  sizing,
  dropTargetId,
  isDropTarget,
  onDragOver,
  onDrop,
  ...props
}: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} sizing={sizing} {...props}>
      <ChildSlot
        className="scn-card"
        dropTargetId={dropTargetId}
        emptyLabel=""
        isDropTarget={isDropTarget}
        nodes={nodes}
        renderNode={renderNode}
        sample={
          <>
            <ScnText weight="medium">SCNCard</ScnText>
            <ScnText color="muted">Content</ScnText>
          </>
        }
        sizing={sizing}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />
    </PreviewFrame>
  )
}

export const cardPreview = {
  definition,
  Preview: CardPreview,
} satisfies PreviewModule
