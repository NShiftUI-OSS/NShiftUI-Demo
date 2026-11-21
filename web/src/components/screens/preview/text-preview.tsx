/* eslint-disable react-refresh/only-export-components */
import { TypeIcon } from 'lucide-react'

import { textAlignment } from '@/components/screens/preview/plugin-layout'
import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnText } from '@/scn/widgets'

const definition = {
  id: 'text',
  name: 'Texto',
  description: 'Título ou conteúdo textual',
  icon: TypeIcon,
  size: { width: 280, height: 48 },
} as const

export function TextPreview(props: PreviewRenderProps) {
  const text = typeof props.values?.text === 'string' ? props.values.text : 'Text'
  const style = textStyle(props.values?.style)
  const weight = textWeight(props.values?.weight)
  const color = textColor(props.values?.color)
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnText align={textAlignment(props.values?.alignment)} color={color} style={style} weight={weight}>
        {text}
      </ScnText>
    </PreviewFrame>
  )
}

function textStyle(value: string | number | boolean | string[] | undefined) {
  if (value === 'xs' || value === 'base' || value === 'lg' || value === 'xl' || value === 'xl2') {
    return value
  }
  return 'sm'
}

function textWeight(value: string | number | boolean | string[] | undefined) {
  if (value === 'medium' || value === 'semibold') return value
  return undefined
}

function textColor(value: string | number | boolean | string[] | undefined) {
  if (value === 'mutedForeground') return 'muted' as const
  if (value === 'primary') return 'primary' as const
  if (value === 'destructive') return 'destructive' as const
  return undefined
}

export const textPreview = {
  definition,
  Preview: TextPreview,
} satisfies PreviewModule
