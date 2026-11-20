import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const checkboxMetadata = definePreviewMetadata('Checkbox')
export type CheckboxMetadata = ReturnType<typeof checkboxMetadata.create>
