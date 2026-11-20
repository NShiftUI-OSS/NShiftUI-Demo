import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const cardMetadata = definePreviewMetadata('Card')
export type CardMetadata = ReturnType<typeof cardMetadata.create>
