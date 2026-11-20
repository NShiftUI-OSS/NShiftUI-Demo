/* eslint-disable react-refresh/only-export-components */
import { GalleryHorizontalIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'horizontal-list',
  name: 'HorizontalList',
  description: 'Lista horizontal dos filhos',
  icon: GalleryHorizontalIcon,
  acceptsChildren: true,
  layout: 'horizontal-scroll',
  size: { width: 280, height: 140 },
} as const

export function HorizontalListPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="horizontal-scroll"
      badge="Lista horizontal"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const horizontalListPreview: PreviewModule = {
  definition,
  Preview: HorizontalListPreview,
}
