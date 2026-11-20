/* eslint-disable react-refresh/only-export-components */
import { PaperclipIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnAttachment } from '@/scn/widgets'

const definition = {
  id: 'attachment',
  name: 'Attachment',
  description: 'Arquivo anexado',
  icon: PaperclipIcon,
  size: { width: 280, height: 72 },
} as const

export function AttachmentPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnAttachment
        detail={previewText(props.values, 'detail', 'Ready')}
        title={previewText(props.values, 'title', 'report.pdf')}
      />
    </PreviewFrame>
  )
}

export const attachmentPreview = {
  definition,
  Preview: AttachmentPreview,
} satisfies PreviewModule
