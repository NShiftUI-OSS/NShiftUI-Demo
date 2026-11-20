import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const verticalScrollMetadata = definePreviewMetadata('VerticalScroll')
export type VerticalScrollMetadata = ReturnType<
  typeof verticalScrollMetadata.create
>
