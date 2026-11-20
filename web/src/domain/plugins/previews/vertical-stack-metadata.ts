import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const verticalStackMetadata = definePreviewMetadata('VerticalStack')
export type VerticalStackMetadata = ReturnType<
  typeof verticalStackMetadata.create
>
