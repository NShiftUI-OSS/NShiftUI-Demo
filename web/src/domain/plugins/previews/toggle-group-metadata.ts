import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const toggleGroupMetadata = definePreviewMetadata('ToggleGroup')
export type ToggleGroupMetadata = ReturnType<typeof toggleGroupMetadata.create>
