import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const badgeMetadata = definePreviewMetadata('Badge')
export type BadgeMetadata = ReturnType<typeof badgeMetadata.create>
