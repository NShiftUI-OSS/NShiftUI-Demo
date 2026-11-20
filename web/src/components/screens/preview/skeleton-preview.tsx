/* eslint-disable react-refresh/only-export-components */
import { SquareDashedIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnSkeleton } from '@/scn/widgets'

const definition = {
  id: 'skeleton',
  name: 'Skeleton',
  description: 'Carregando conteúdo',
  icon: SquareDashedIcon,
  size: { width: 280, height: 56 },
} as const

export function SkeletonPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnSkeleton />
    </PreviewFrame>
  )
}

export const skeletonPreview = {
  definition,
  Preview: SkeletonPreview,
} satisfies PreviewModule
