import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const horizontalListMetadata = definePreviewMetadata('HorizontalList')
export type HorizontalListMetadata = ReturnType<
  typeof horizontalListMetadata.create
>
