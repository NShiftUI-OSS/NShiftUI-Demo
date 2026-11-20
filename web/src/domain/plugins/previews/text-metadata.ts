import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const textMetadata = definePreviewMetadata('Text')
export type TextMetadata = ReturnType<typeof textMetadata.create>
