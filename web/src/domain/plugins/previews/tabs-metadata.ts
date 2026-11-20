import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const tabsMetadata = definePreviewMetadata('Tabs')
export type TabsMetadata = ReturnType<typeof tabsMetadata.create>
