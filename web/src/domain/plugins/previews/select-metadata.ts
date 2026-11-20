import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const selectMetadata = definePreviewMetadata('Select')
export type SelectMetadata = ReturnType<typeof selectMetadata.create>
