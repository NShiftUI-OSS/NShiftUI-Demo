import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const switchMetadata = definePreviewMetadata('Switch')
export type SwitchMetadata = ReturnType<typeof switchMetadata.create>
