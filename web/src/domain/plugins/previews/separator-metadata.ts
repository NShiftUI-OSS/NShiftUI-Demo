import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const separatorMetadata = definePreviewMetadata('Separator')
export type SeparatorMetadata = ReturnType<typeof separatorMetadata.create>
