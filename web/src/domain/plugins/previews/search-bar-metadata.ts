import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const searchBarMetadata = definePreviewMetadata('SearchBar')
export type SearchBarMetadata = ReturnType<typeof searchBarMetadata.create>
