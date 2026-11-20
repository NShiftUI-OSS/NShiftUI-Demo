import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const containerMetadata = definePreviewMetadata('Container')
export type ContainerMetadata = ReturnType<typeof containerMetadata.create>
