/* eslint-disable react-refresh/only-export-components */
import { ToggleRightIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewFlag } from '@/scn/preview-values'
import { ScnSwitch } from '@/scn/widgets'

const definition = {
  id: 'switch',
  name: 'Switch',
  description: 'Liga e desliga',
  icon: ToggleRightIcon,
  size: { width: 280, height: 48 },
} as const

export function SwitchPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values && 'isOn' in props.values ? (
        <ScnSwitch label="" on={previewFlag(props.values, 'isOn', true)} />
      ) : (
        <span className="scn-row">
          <ScnSwitch label="" />
          <ScnSwitch label="" on={false} />
        </span>
      )}
    </PreviewFrame>
  )
}

export const switchPreview = {
  definition,
  Preview: SwitchPreview,
} satisfies PreviewModule
