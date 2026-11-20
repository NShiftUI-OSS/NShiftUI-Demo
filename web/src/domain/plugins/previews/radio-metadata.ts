import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const radioMetadata = definePreviewMetadata('Radio')
export type RadioMetadata = ReturnType<typeof radioMetadata.create>
