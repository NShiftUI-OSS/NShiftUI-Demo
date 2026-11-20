/* eslint-disable react-refresh/only-export-components */
import { CalendarIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnCalendar } from '@/scn/widgets'

const definition = {
  id: 'calendar',
  name: 'Calendar',
  description: 'Seleção de data',
  icon: CalendarIcon,
  size: { width: 280, height: 220 },
} as const

export function CalendarPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnCalendar />
    </PreviewFrame>
  )
}

export const calendarPreview = {
  definition,
  Preview: CalendarPreview,
} satisfies PreviewModule
