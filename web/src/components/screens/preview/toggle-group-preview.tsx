/* eslint-disable react-refresh/only-export-components */
import { ToggleLeftIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewList, previewText } from '@/scn/preview-values'
import { ScnToggleGroup } from '@/scn/widgets'

const definition = {
  id: 'toggle-group',
  name: 'ToggleGroup',
  description: 'Estados exclusivos',
  icon: ToggleLeftIcon,
  size: { width: 280, height: 48 },
} as const

export function ToggleGroupPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnToggleGroup
        options={previewList(props.values, 'options', ['Day', 'Week', 'Month'])}
        selected={previewText(props.values, 'selection', 'Day')}
      />
    </PreviewFrame>
  )
}

export const toggleGroupPreview = {
  definition,
  Preview: ToggleGroupPreview,
} satisfies PreviewModule
