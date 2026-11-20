import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const skeletonMetadata = definePreviewMetadata('Skeleton')
export type SkeletonMetadata = ReturnType<typeof skeletonMetadata.create>
