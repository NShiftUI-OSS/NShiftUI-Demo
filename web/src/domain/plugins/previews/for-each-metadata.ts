import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const forEachMetadata = definePreviewMetadata('ForEach')
export type ForEachMetadata = ReturnType<typeof forEachMetadata.create>
