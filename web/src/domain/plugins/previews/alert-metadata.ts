import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const alertMetadata = definePreviewMetadata('Alert')
export type AlertMetadata = ReturnType<typeof alertMetadata.create>
