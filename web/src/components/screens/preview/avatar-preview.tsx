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
  const imageURL = previewText(props.values, 'imageURL', '')
  const rawSize = props.values?.size
  const size =
    rawSize === 'sm' || rawSize === 'lg' || rawSize === 'xl'
      ? rawSize
      : 'default'

  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.initials ? (
        <ScnAvatar
          letters={previewText(props.values, 'initials', 'NS')}
          size={size}
          imageURL={imageURL}
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
