import { definePreviewMetadata } from '@/domain/plugins/previews/define-preview-metadata'

export const calendarMetadata = definePreviewMetadata('Calendar')
export type CalendarMetadata = ReturnType<typeof calendarMetadata.create>
