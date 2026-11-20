/* eslint-disable react-refresh/only-export-components */
import { Rows3Icon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'vertical-stack',
  name: 'VerticalStack',
  description: 'Organiza filhos verticalmente',
  icon: Rows3Icon,
  acceptsChildren: true,
  layout: 'vertical',
  size: { width: 280, height: 180 },
} as const

export function VerticalStackPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="vertical"
      badge="Vertical"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const verticalStackPreview: PreviewModule = {
  definition,
  Preview: VerticalStackPreview,
}
