import type { LucideIcon } from 'lucide-react'
import type { DragEventHandler, PointerEventHandler, ReactNode } from 'react'

export type PreviewNode = {
  id: string
  componentId: string
  children: PreviewNode[]
  props?: Record<string, string | number | boolean | string[]>
}

export type PreviewLayout =
  | 'vertical'
  | 'horizontal'
  | 'layer'
  | 'vertical-scroll'
  | 'horizontal-scroll'
export type PreviewSizing = 'fill' | 'intrinsic'

export type ScreenComponentDefinition = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  acceptsChildren?: boolean
  layout?: PreviewLayout
  size: {
    width: number
    height: number
  }
}

export type PreviewRenderProps = {
  sizing?: PreviewSizing
  ghost?: boolean
  position?: { x: number; y: number }
  className?: string
  interactive?: boolean
  draggable?: boolean
  onPointerDown?: PointerEventHandler<HTMLDivElement>
  onDragStart?: DragEventHandler<HTMLDivElement>
  onDragEnd?: DragEventHandler<HTMLDivElement>
  values?: Record<string, string | number | boolean | string[]>
  nodes?: PreviewNode[]
  renderNode?: (node: PreviewNode, sizing: PreviewSizing) => ReactNode
  dropTargetId?: string
  catalog?: boolean
  isDropTarget?: boolean
  onDragOver?: DragEventHandler<HTMLDivElement>
  onDrop?: DragEventHandler<HTMLDivElement>
}

export type PreviewModule = {
  definition: ScreenComponentDefinition
  Preview: (props: PreviewRenderProps) => ReactNode
}
