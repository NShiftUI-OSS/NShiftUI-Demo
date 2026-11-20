import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const inputOtpMetadata = definePreviewMetadata('InputOTP')
export type InputOTPMetadata = ReturnType<typeof inputOtpMetadata.create>
