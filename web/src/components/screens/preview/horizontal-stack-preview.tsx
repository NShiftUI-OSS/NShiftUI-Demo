/* eslint-disable react-refresh/only-export-components */
import { Columns3Icon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'horizontal-stack',
  name: 'HorizontalStack',
  description: 'Organiza filhos horizontalmente',
  icon: Columns3Icon,
  acceptsChildren: true,
  layout: 'horizontal',
  size: { width: 280, height: 140 },
} as const

export function HorizontalStackPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="horizontal"
      badge="Horizontal"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const horizontalStackPreview: PreviewModule = {
  definition,
  Preview: HorizontalStackPreview,
}
