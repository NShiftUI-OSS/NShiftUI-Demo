/* eslint-disable react-refresh/only-export-components */
import { RepeatIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'for-each',
  name: 'ForEach',
  description: 'Repete o template para cada item de uma lista (UpdateListEvent)',
  icon: RepeatIcon,
  acceptsChildren: true,
  layout: 'vertical',
  size: { width: 280, height: 180 },
} as const

/** The template is previewed once, as a sample of each list item. */
export function ForEachPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="vertical"
      badge="ForEach"
      emptyLabel=""
      {...props}
    />
  )
}

export const forEachPreview: PreviewModule = {
  definition,
  Preview: ForEachPreview,
}
