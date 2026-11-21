import type { ReactNode } from 'react'

import { heightMode, widthMode } from '@/components/screens/preview/plugin-layout'
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
  values,
  className,
  children,
}: PreviewFrameProps) {
  const canvas = ghost || (sizing === 'intrinsic' && !values)
  const hug = !canvas && (definition.id === 'text' || widthMode(definition.id, values) === 'hug')
  const fixedHeight = !canvas && heightMode(values) === 'fixed'

  return (
    <div
      className={cn(
        'pointer-events-none relative flex min-w-0 flex-col overflow-clip select-none',
        canvas && 'scn-pad w-max rounded-lg',
        !canvas && hug && 'w-fit max-w-full',
        !canvas && !hug && 'w-full [&>*]:w-full',
        fixedHeight && 'h-full',
        className,
      )}
      style={
        canvas
          ? { width: definition.size.width, height: definition.size.height }
          : undefined
      }
    >
      {children}
    </div>
  )
}
