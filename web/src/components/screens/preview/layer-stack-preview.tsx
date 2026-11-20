/* eslint-disable react-refresh/only-export-components */
import { LayersIcon } from 'lucide-react'

import { LayoutPreview } from '@/components/screens/preview/layout-preview-frame'
import type {
  PreviewModule,
  PreviewRenderProps,
} from '@/components/screens/preview/types'

const definition = {
  id: 'layer-stack',
  name: 'LayerStack',
  description: 'Empilha filhos em camadas',
  icon: LayersIcon,
  acceptsChildren: true,
  layout: 'layer',
  size: { width: 280, height: 180 },
} as const

export function LayerStackPreview(props: PreviewRenderProps) {
  return (
    <LayoutPreview
      definition={definition}
      layout="layer"
      badge="Camadas"
      emptyLabel="Solte componentes aqui"
      {...props}
    />
  )
}

export const layerStackPreview: PreviewModule = {
  definition,
  Preview: LayerStackPreview,
}
