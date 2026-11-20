import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const inputMetadata = definePreviewMetadata('Input')
export type InputMetadata = ReturnType<typeof inputMetadata.create>
