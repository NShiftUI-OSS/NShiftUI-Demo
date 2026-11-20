import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const spinnerMetadata = definePreviewMetadata('Spinner')
export type SpinnerMetadata = ReturnType<typeof spinnerMetadata.create>
