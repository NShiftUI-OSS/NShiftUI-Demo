import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const imageMetadata = definePreviewMetadata('Image')
export type ImageMetadata = ReturnType<typeof imageMetadata.create>
