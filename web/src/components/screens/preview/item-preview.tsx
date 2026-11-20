/* eslint-disable react-refresh/only-export-components */
import { ListIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnItem } from '@/scn/widgets'

const definition = {
  id: 'item',
  name: 'Item',
  description: 'Linha de conteúdo',
  icon: ListIcon,
  size: { width: 280, height: 72 },
} as const

export function ItemPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnItem
        initials={previewText(props.values, 'initials', 'AL')}
        subtitle={previewText(props.values, 'subtitle', 'Mathematics')}
        title={previewText(props.values, 'title', 'Ada Lovelace')}
      />
    </PreviewFrame>
  )
}

export const itemPreview = {
  definition,
  Preview: ItemPreview,
} satisfies PreviewModule
