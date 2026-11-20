/* eslint-disable react-refresh/only-export-components */
import { MinusIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnSeparator, ScnText } from '@/scn/widgets'

const definition = {
  id: 'separator',
  name: 'Separator',
  description: 'Divisão visual',
  icon: MinusIcon,
  size: { width: 280, height: 24 },
} as const

export function SeparatorPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <div style={{ display: 'grid', gap: 12, width: '100%' }}>
        <ScnSeparator />
        <span className="scn-row">
          <ScnText>A</ScnText>
          <ScnSeparator axis="vertical" />
          <ScnText>B</ScnText>
        </span>
      </div>
    </PreviewFrame>
  )
}

export const separatorPreview = {
  definition,
  Preview: SeparatorPreview,
} satisfies PreviewModule
