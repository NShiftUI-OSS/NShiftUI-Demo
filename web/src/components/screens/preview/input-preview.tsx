/* eslint-disable react-refresh/only-export-components */
import { TextCursorInputIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnField } from '@/scn/widgets'

const definition = {
  id: 'input',
  name: 'Input',
  description: 'Campo de texto',
  icon: TextCursorInputIcon,
  size: { width: 280, height: 64 },
} as const

export function InputPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnField
        placeholder={
          typeof props.values?.placeholder === 'string' ? props.values.placeholder : 'Name'
        }
        value={typeof props.values?.text === 'string' ? props.values.text : undefined}
      />
    </PreviewFrame>
  )
}

export const inputPreview = {
  definition,
  Preview: InputPreview,
} satisfies PreviewModule
