/* eslint-disable react-refresh/only-export-components */
import { PanelTopIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewList, previewText } from '@/scn/preview-values'
import { ScnTabs } from '@/scn/widgets'

const definition = {
  id: 'tabs',
  name: 'Tabs',
  description: 'Seções alternáveis',
  icon: PanelTopIcon,
  size: { width: 280, height: 52 },
} as const

export function TabsPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <ScnTabs
        selected={previewText(props.values, 'selection', 'Account')}
        titles={previewList(props.values, 'titles', ['Account', 'Password'])}
      />
    </PreviewFrame>
  )
}

export const tabsPreview = {
  definition,
  Preview: TabsPreview,
} satisfies PreviewModule
