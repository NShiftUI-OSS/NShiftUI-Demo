import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const fieldMetadata = definePreviewMetadata('Field')
export type FieldMetadata = ReturnType<typeof fieldMetadata.create>
