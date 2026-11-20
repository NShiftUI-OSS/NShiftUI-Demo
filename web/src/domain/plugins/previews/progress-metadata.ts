import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const progressMetadata = definePreviewMetadata('Progress')
export type ProgressMetadata = ReturnType<typeof progressMetadata.create>
