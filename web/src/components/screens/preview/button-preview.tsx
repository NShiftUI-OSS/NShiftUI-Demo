/* eslint-disable react-refresh/only-export-components */
import { RectangleHorizontalIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewFlag, previewText } from '@/scn/preview-values'
import { ScnButton } from '@/scn/widgets'

const definition = {
  id: 'button',
  name: 'Botão',
  description: 'Ação principal',
  icon: RectangleHorizontalIcon,
  size: { width: 280, height: 52 },
} as const

export function ButtonPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnButton
        disabled={previewFlag(props.values, 'isEnabled', true) === false}
        size={buttonSize(props.values?.size)}
        variant={buttonVariant(props.values?.variant)}
      >
        {previewText(props.values, 'title', 'Button')}
      </ScnButton>
    </PreviewFrame>
  )
}

function buttonVariant(value: string | number | boolean | string[] | undefined) {
  if (
    value === 'outline' ||
    value === 'secondary' ||
    value === 'ghost' ||
    value === 'destructive' ||
    value === 'link'
  ) {
    return value
  }
  return 'default' as const
}

function buttonSize(value: string | number | boolean | string[] | undefined) {
  if (value === 'xs' || value === 'sm' || value === 'lg' || value === 'icon') return value
  return 'default' as const
}

export const buttonPreview = {
  definition,
  Preview: ButtonPreview,
} satisfies PreviewModule
