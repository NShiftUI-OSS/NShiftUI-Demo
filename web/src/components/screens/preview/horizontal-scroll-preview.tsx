/* eslint-disable react-refresh/only-export-components */
import { ArrowRightIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'horizontal-scroll',
  name: 'HorizontalScroll',
  description: 'Rolagem horizontal dos filhos',
  icon: ArrowRightIcon,
  acceptsChildren: true,
  layout: 'horizontal-scroll',
  size: { width: 280, height: 140 },
} as const

export function HorizontalScrollPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="horizontal-scroll"
      badge="Scroll horizontal"
      emptyLabel=""
      {...props}
    />
  )
}

export const horizontalScrollPreview: PreviewModule = {
  definition,
  Preview: HorizontalScrollPreview,
}
