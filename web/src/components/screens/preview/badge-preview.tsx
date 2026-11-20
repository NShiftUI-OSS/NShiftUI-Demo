/* eslint-disable react-refresh/only-export-components */
import { BadgeIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnBadge } from '@/scn/widgets'

const definition = {
  id: 'badge',
  name: 'Badge',
  description: 'Rótulo curto',
  icon: BadgeIcon,
  size: { width: 280, height: 48 },
} as const

export function BadgePreview(props: PreviewRenderProps) {
  const variant = badgeVariant(props.values?.variant)
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.text ? (
        <ScnBadge variant={variant}>{previewText(props.values, 'text', 'Default')}</ScnBadge>
      ) : (
        <div className="scn-row">
          <ScnBadge>Default</ScnBadge>
          <ScnBadge variant="secondary">Secondary</ScnBadge>
          <ScnBadge variant="destructive">Destructive</ScnBadge>
          <ScnBadge variant="outline">Outline</ScnBadge>
        </div>
      )}
    </PreviewFrame>
  )
}

function badgeVariant(value: string | number | boolean | string[] | undefined) {
  if (
    value === 'secondary' ||
    value === 'destructive' ||
    value === 'outline' ||
    value === 'ghost' ||
    value === 'link'
  ) {
    return value
  }
  return 'default' as const
}

export const badgePreview = {
  definition,
  Preview: BadgePreview,
} satisfies PreviewModule
