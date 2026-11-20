/* eslint-disable react-refresh/only-export-components */
import { SlidersHorizontalIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewNumber } from '@/scn/preview-values'
import { ScnSlider } from '@/scn/widgets'

const definition = {
  id: 'slider',
  name: 'Slider',
  description: 'Valor em intervalo',
  icon: SlidersHorizontalIcon,
  size: { width: 280, height: 36 },
} as const

export function SliderPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnSlider value={previewNumber(props.values, 'value', 0.45)} />
    </PreviewFrame>
  )
}

export const sliderPreview = {
  definition,
  Preview: SliderPreview,
} satisfies PreviewModule
