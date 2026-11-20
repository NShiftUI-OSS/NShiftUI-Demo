import type { ReactNode } from 'react'

import type {
  PreviewRenderProps,
  ScreenComponentDefinition,
} from '@/components/screens/preview/types'
import { cn } from '@/lib/utils'

type PreviewFrameProps = PreviewRenderProps & {
  definition: ScreenComponentDefinition
  children: ReactNode
}

export function PreviewFrame({
  definition,
  sizing = 'fill',
  ghost = false,
  position,
  className,
  interactive = false,
  draggable = false,
  onPointerDown,
  onDragStart,
  onDragEnd,
  dropTargetId,
  children,
}: PreviewFrameProps) {
  const floating = Boolean(ghost || position)
  const intrinsic = sizing === 'intrinsic'

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-stretch overflow-clip select-none',
        floating ? 'scn-pad w-max rounded-lg' : 'w-full [&>*]:w-full',
        className,
      )}
      data-layout-node={dropTargetId}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? definition.name : undefined}
      style={{
        ...(position
          ? {
              left: position.x,
              top: position.y,
              transform: ghost ? 'translate(-50%, -50%)' : undefined,
            }
          : {}),
        width: floating || intrinsic ? definition.size.width : '100%',
        height: floating || intrinsic ? definition.size.height : undefined,
        position: ghost ? 'fixed' : position ? 'absolute' : 'relative',
        touchAction: 'none',
        zIndex: ghost ? 60 : undefined,
      }}
      onPointerDown={onPointerDown}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
    </div>
  )
}
