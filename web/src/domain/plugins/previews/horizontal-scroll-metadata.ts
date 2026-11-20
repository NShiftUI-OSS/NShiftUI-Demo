import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const horizontalScrollMetadata = definePreviewMetadata('HorizontalScroll')
export type HorizontalScrollMetadata = ReturnType<
  typeof horizontalScrollMetadata.create
>
