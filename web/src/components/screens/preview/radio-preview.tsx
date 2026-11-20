/* eslint-disable react-refresh/only-export-components */
import { CircleDotIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnRadio } from '@/scn/widgets'

const definition = {
  id: 'radio',
  name: 'Radio',
  description: 'Uma opção',
  icon: CircleDotIcon,
  size: { width: 280, height: 48 },
} as const

export function RadioPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.title ? (
        <ScnRadio label={String(props.values.title)} on={props.values.isOn !== false} />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <ScnRadio label="Selected" />
          <ScnRadio label="Unselected" on={false} />
        </div>
      )}
    </PreviewFrame>
  )
}

export const radioPreview = {
  definition,
  Preview: RadioPreview,
} satisfies PreviewModule
