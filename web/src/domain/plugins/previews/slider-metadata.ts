import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const sliderMetadata = definePreviewMetadata('Slider')
export type SliderMetadata = ReturnType<typeof sliderMetadata.create>
