/* eslint-disable react-refresh/only-export-components */
import { HashIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewNumber, previewText } from '@/scn/preview-values'
import { ScnOtp } from '@/scn/widgets'

const definition = {
  id: 'input-otp',
  name: 'InputOTP',
  description: 'Código de verificação',
  icon: HashIcon,
  size: { width: 280, height: 64 },
} as const

export function InputOtpPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnOtp
        code={previewText(props.values, 'code', '12')}
        length={previewNumber(props.values, 'length', 6)}
      />
    </PreviewFrame>
  )
}

export const inputOtpPreview = {
  definition,
  Preview: InputOtpPreview,
} satisfies PreviewModule
