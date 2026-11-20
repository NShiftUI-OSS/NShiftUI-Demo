import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const buttonMetadata = definePreviewMetadata('Button')
export type ButtonMetadata = ReturnType<typeof buttonMetadata.create>
