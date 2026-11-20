import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const textareaMetadata = definePreviewMetadata('Textarea')
export type TextareaMetadata = ReturnType<typeof textareaMetadata.create>
