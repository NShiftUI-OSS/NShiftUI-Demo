/* eslint-disable react-refresh/only-export-components */
import { PanelBottomIcon } from 'lucide-react'

import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnIconMark } from '@/scn/scn-icon'
import { ScnText } from '@/scn/widgets'

const definition = {
  id: 'tab-bar',
  name: 'TabBar',
  description: 'Fica fixa na base da tela, fora do scroll',
  icon: PanelBottomIcon,
  acceptsChildren: true,
  size: { width: 280, height: 64 },
} as const

export function TabBarPreview({
  nodes = [],
  renderNode,
}: PreviewRenderProps) {
  return (
    <div
      className="bg-background pointer-events-none flex w-full border-t"
      data-layout="horizontal"
    >
      {nodes.length === 0 ? null : (
        nodes.map((node, index) => (
          <div
            key={node.id}
            className="flex min-w-0 flex-1 justify-center"
            data-selected={index === 0}
          >
            {renderNode?.(node, 'fill')}
          </div>
        ))
      )}
    </div>
  )
}

export const tabBarPreview = {
  definition,
  Preview: TabBarPreview,
} satisfies PreviewModule

const tabDefinition = {
  id: 'tab',
  name: 'Tab',
  description: 'Aba da tab bar. A primeira é a tela atual',
  icon: PanelBottomIcon,
  size: { width: 88, height: 56 },
} as const

export function TabPreview({ values }: PreviewRenderProps) {
  const title = typeof values?.title === 'string' && values.title ? values.title : 'Aba'
  const icon = typeof values?.icon === 'string' ? values.icon : ''
  const route = typeof values?.route === 'string' ? values.route : ''
  return (
    <div className="flex w-full flex-col items-center gap-1 px-1 py-2">
      {icon ? <ScnIconMark name={icon} size={16} /> : null}
      <ScnText style="xs">{title}</ScnText>
      {route ? <span className="text-muted-foreground text-[9px]">{route}</span> : null}
    </div>
  )
}

export const tabPreview = {
  definition: tabDefinition,
  Preview: TabPreview,
} satisfies PreviewModule
