/* eslint-disable react-refresh/only-export-components */
import { SearchIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnBadge, ScnSearchBar } from '@/scn/widgets'

const definition = {
  id: 'search-bar',
  name: 'SearchBar',
  description: 'Busca fixa no topo da tela (slot SearchBar)',
  icon: SearchIcon,
  size: { width: 280, height: 64 },
} as const

export function SearchBarPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <ScnSearchBar
          placeholder={
            typeof props.values?.placeholder === 'string' && props.values.placeholder
              ? props.values.placeholder
              : 'Buscar'
          }
          value={typeof props.values?.text === 'string' ? props.values.text : undefined}
        />
        {props.nodes && props.nodes.length > 0 ? (
          <div className="scn-hide-scrollbar flex gap-2 overflow-x-auto">
            {props.nodes.map((node) => (
              <div key={node.id} className="shrink-0">
                {node.componentId === 'badge' ? (
                  <ScnBadge variant={badgeVariant(node.props, node === props.nodes?.[0])}>
                    {String(node.props?.text ?? '')}
                  </ScnBadge>
                ) : (
                  props.renderNode?.(node, 'intrinsic')
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PreviewFrame>
  )
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
const variants: BadgeVariant[] = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link']

/** Selectable badges preview as selected when their value is empty (the initial selection). */
function badgeVariant(
  values: Record<string, string | number | boolean | string[]> | undefined,
  first: boolean,
): BadgeVariant {
  const selectable = typeof values?.input === 'string' && values.input !== ''
  const selected = selectable && (values?.value === '' || (values?.value === undefined && first))
  const raw = selected ? values?.selectedVariant ?? 'default' : values?.variant
  return variants.includes(raw as BadgeVariant) ? (raw as BadgeVariant) : 'default'
}

export const searchBarPreview = {
  definition,
  Preview: SearchBarPreview,
} satisfies PreviewModule
