import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const itemMetadata = definePreviewMetadata('Item')
export type ItemMetadata = ReturnType<typeof itemMetadata.create>
