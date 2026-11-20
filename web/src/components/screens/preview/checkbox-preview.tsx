/* eslint-disable react-refresh/only-export-components */
import { SquareCheckIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnCheck } from '@/scn/widgets'

const definition = {
  id: 'checkbox',
  name: 'Checkbox',
  description: 'Escolha marcada',
  icon: SquareCheckIcon,
  size: { width: 280, height: 48 },
} as const

export function CheckboxPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.title ? (
        <ScnCheck label={String(props.values.title)} on={props.values.isOn !== false} />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <ScnCheck label="Checked" />
          <ScnCheck label="Unchecked" on={false} />
        </div>
      )}
    </PreviewFrame>
  )
}

export const checkboxPreview = {
  definition,
  Preview: CheckboxPreview,
} satisfies PreviewModule
