/* eslint-disable react-refresh/only-export-components */
import { ArrowDownIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'vertical-scroll',
  name: 'VerticalScroll',
  description: 'Rolagem vertical dos filhos',
  icon: ArrowDownIcon,
  acceptsChildren: true,
  layout: 'vertical-scroll',
  size: { width: 280, height: 220 },
} as const

export function VerticalScrollPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="vertical-scroll"
      badge="Scroll vertical"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const verticalScrollPreview: PreviewModule = {
  definition,
  Preview: VerticalScrollPreview,
}
