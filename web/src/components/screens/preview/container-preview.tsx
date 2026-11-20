/* eslint-disable react-refresh/only-export-components */
import { BoxIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'
import { ScnCard, ScnText } from '@/scn/widgets'

const definition = {
  id: 'container',
  name: 'Container',
  description: 'Agrupa outros componentes',
  icon: BoxIcon,
  size: { width: 236, height: 164 },
} as const

export function ContainerPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnCard>
        <ScnText weight="medium">Container</ScnText>
        <ScnText color="muted">Agrupa o conteúdo.</ScnText>
      </ScnCard>
    </PreviewFrame>
  )
}

export const containerPreview: PreviewModule = {
  definition,
  Preview: ContainerPreview,
}
