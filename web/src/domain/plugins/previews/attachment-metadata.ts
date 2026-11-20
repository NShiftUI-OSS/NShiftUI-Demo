import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const attachmentMetadata = definePreviewMetadata('Attachment')
export type AttachmentMetadata = ReturnType<typeof attachmentMetadata.create>
