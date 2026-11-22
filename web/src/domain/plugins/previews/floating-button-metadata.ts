import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const floatingButtonMetadata = definePreviewMetadata('FloatingButton')
export type FloatingButtonMetadata = ReturnType<typeof floatingButtonMetadata.create>
