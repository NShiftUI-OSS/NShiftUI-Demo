/* eslint-disable react-refresh/only-export-components */
import { CircleUserIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnAvatar } from '@/scn/widgets'

const definition = {
  id: 'avatar',
  name: 'Avatar',
  description: 'Identidade visual',
  icon: CircleUserIcon,
  size: { width: 280, height: 64 },
} as const

export function AvatarPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.initials ? (
        <ScnAvatar
          letters={previewText(props.values, 'initials', 'NS')}
          size={props.values.size === 'sm' || props.values.size === 'lg' ? props.values.size : 'default'}
        />
      ) : (
        <span className="scn-row">
          <ScnAvatar letters="NS" size="sm" />
          <ScnAvatar letters="NS" />
          <ScnAvatar letters="NS" size="lg" />
        </span>
      )}
    </PreviewFrame>
  )
}

export const avatarPreview = {
  definition,
  Preview: AvatarPreview,
} satisfies PreviewModule
