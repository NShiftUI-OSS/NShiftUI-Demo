/* eslint-disable react-refresh/only-export-components */
import { ChevronsUpDownIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnSelect } from '@/scn/widgets'

const definition = {
  id: 'select',
  name: 'Select',
  description: 'Lista de opções',
  icon: ChevronsUpDownIcon,
  size: { width: 280, height: 64 },
} as const

export function SelectPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnSelect value={previewText(props.values, 'selection', 'Selecione')} />
    </PreviewFrame>
  )
}

export const selectPreview = {
  definition,
  Preview: SelectPreview,
} satisfies PreviewModule
