/* eslint-disable react-refresh/only-export-components */
import { AlignLeftIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnTextarea } from '@/scn/widgets'

const definition = {
  id: 'textarea',
  name: 'Textarea',
  description: 'Texto longo',
  icon: AlignLeftIcon,
  size: { width: 280, height: 100 },
} as const

export function TextareaPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnTextarea
        placeholder={previewText(props.values, 'placeholder', previewText(props.values, 'text', 'Write a message'))}
      />
    </PreviewFrame>
  )
}

export const textareaPreview = {
  definition,
  Preview: TextareaPreview,
} satisfies PreviewModule
