/* eslint-disable react-refresh/only-export-components */
import { SearchIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { ScnSearchBar } from '@/scn/widgets'

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
      <ScnSearchBar
        placeholder={
          typeof props.values?.placeholder === 'string' && props.values.placeholder
            ? props.values.placeholder
            : 'Buscar'
        }
        value={typeof props.values?.text === 'string' ? props.values.text : undefined}
      />
    </PreviewFrame>
  )
}

export const searchBarPreview = {
  definition,
  Preview: SearchBarPreview,
} satisfies PreviewModule
