import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const verticalListMetadata = definePreviewMetadata('VerticalList')
export type VerticalListMetadata = ReturnType<typeof verticalListMetadata.create>
