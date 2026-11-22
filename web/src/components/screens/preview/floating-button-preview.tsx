/* eslint-disable react-refresh/only-export-components */
import { CirclePlusIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnFloatingButton } from '@/scn/widgets'

const definition = {
  id: 'floating-button',
  name: 'FloatingButton',
  description: 'Botão redondo flutuante com badge de contagem (slot FloatingButton)',
  icon: CirclePlusIcon,
  size: { width: 72, height: 72 },
} as const

export function FloatingButtonPreview(props: PreviewRenderProps) {
  const icon = typeof props.values?.icon === 'string' && props.values.icon ? props.values.icon : 'plus'
  const badge = typeof props.values?.badge === 'string' ? props.values.badge : ''
  const list = typeof props.values?.badgeList === 'string' ? props.values.badgeList : ''
  // A list count is only known at runtime; the preview shows a sample count.
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnFloatingButton icon={icon} badge={badge || (list ? '3' : '')} />
    </PreviewFrame>
  )
}

export const floatingButtonPreview = {
  definition,
  Preview: FloatingButtonPreview,
} satisfies PreviewModule
