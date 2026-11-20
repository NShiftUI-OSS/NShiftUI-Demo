/* eslint-disable react-refresh/only-export-components */
import { TextCursorIcon } from 'lucide-react'

import { ChildSlot } from '@/components/screens/preview/child-slot'
import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnField, ScnLabel } from '@/scn/widgets'

const definition = {
  id: 'field',
  name: 'Field',
  description: 'Rótulo e campo',
  icon: TextCursorIcon,
  acceptsChildren: true,
  size: { width: 280, height: 72 },
} as const

export function FieldPreview({
  nodes,
  renderNode,
  sizing,
  dropTargetId,
  isDropTarget,
  onDragOver,
  onDrop,
  values,
  ...props
}: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} sizing={sizing} {...props}>
      <ScnLabel
        hint={previewText(values, 'hint', 'Shown on your profile')}
        label={previewText(values, 'label', 'Name')}
      >
        <ChildSlot
          dropTargetId={dropTargetId}
          isDropTarget={isDropTarget}
          nodes={nodes}
          renderNode={renderNode}
          sample={<ScnField placeholder="Ada" />}
          sizing={sizing}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      </ScnLabel>
    </PreviewFrame>
  )
}

export const fieldPreview = {
  definition,
  Preview: FieldPreview,
} satisfies PreviewModule
