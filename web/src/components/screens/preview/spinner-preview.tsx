/* eslint-disable react-refresh/only-export-components */
import { LoaderCircleIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnSpinner } from '@/scn/widgets'

const definition = {
  id: 'spinner',
  name: 'Spinner',
  description: 'Indicador de espera',
  icon: LoaderCircleIcon,
  size: { width: 280, height: 40 },
} as const

export function SpinnerPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnSpinner />
    </PreviewFrame>
  )
}

export const spinnerPreview = {
  definition,
  Preview: SpinnerPreview,
} satisfies PreviewModule
