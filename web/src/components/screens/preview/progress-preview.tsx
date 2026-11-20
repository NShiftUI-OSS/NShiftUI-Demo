/* eslint-disable react-refresh/only-export-components */
import { LoaderIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewNumber } from '@/scn/preview-values'
import { ScnProgress } from '@/scn/widgets'

const definition = {
  id: 'progress',
  name: 'Progress',
  description: 'Progresso de uma tarefa',
  icon: LoaderIcon,
  size: { width: 280, height: 40 },
} as const

export function ProgressPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {typeof props.values?.value === 'number' ? (
        <ScnProgress value={previewNumber(props.values, 'value', 0.6)} />
      ) : (
        <div style={{ display: 'grid', gap: 8, width: '100%' }}>
          <ScnProgress value={0.25} />
          <ScnProgress value={0.6} />
          <ScnProgress value={1} />
        </div>
      )}
    </PreviewFrame>
  )
}

export const progressPreview = {
  definition,
  Preview: ProgressPreview,
} satisfies PreviewModule
