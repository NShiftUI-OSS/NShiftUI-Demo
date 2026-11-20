import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const buttonGroupMetadata = definePreviewMetadata('ButtonGroup')
export type ButtonGroupMetadata = ReturnType<typeof buttonGroupMetadata.create>
