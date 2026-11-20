/* eslint-disable react-refresh/only-export-components */
import { ListIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'vertical-list',
  name: 'VerticalList',
  description: 'Lista vertical dos filhos',
  icon: ListIcon,
  acceptsChildren: true,
  layout: 'vertical-scroll',
  size: { width: 280, height: 220 },
} as const

export function VerticalListPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="vertical-scroll"
      badge="Lista vertical"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const verticalListPreview: PreviewModule = {
  definition,
  Preview: VerticalListPreview,
}
