/* eslint-disable react-refresh/only-export-components */
import { Rows3Icon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewList } from '@/scn/preview-values'
import { ScnButtonGroup } from '@/scn/widgets'

const definition = {
  id: 'button-group',
  name: 'ButtonGroup',
  description: 'Ações agrupadas',
  icon: Rows3Icon,
  size: { width: 280, height: 52 },
} as const

export function ButtonGroupPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnButtonGroup titles={previewList(props.values, 'titles', ['Day', 'Week', 'Month'])} />
    </PreviewFrame>
  )
}

export const buttonGroupPreview = {
  definition,
  Preview: ButtonGroupPreview,
} satisfies PreviewModule
