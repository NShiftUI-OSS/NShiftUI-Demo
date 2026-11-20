/* eslint-disable react-refresh/only-export-components */
import { ImageIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnImage } from '@/scn/widgets'

const definition = {
  id: 'image',
  name: 'Imagem',
  description: 'Imagem do conteúdo',
  icon: ImageIcon,
  size: { width: 280, height: 112 },
} as const

export function ImagePreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnImage />
    </PreviewFrame>
  )
}

export const imagePreview = {
  definition,
  Preview: ImagePreview,
} satisfies PreviewModule
