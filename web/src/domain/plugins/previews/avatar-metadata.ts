import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const avatarMetadata = definePreviewMetadata('Avatar')
export type AvatarMetadata = ReturnType<typeof avatarMetadata.create>
