import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const horizontalStackMetadata = definePreviewMetadata('HorizontalStack')
export type HorizontalStackMetadata = ReturnType<
  typeof horizontalStackMetadata.create
>
