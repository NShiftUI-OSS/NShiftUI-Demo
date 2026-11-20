import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const layerStackMetadata = definePreviewMetadata('LayerStack')
export type LayerStackMetadata = ReturnType<typeof layerStackMetadata.create>
