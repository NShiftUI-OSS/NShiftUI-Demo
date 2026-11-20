/* eslint-disable react-refresh/only-export-components */
import { TriangleAlertIcon } from 'lucide-react'

import { PreviewFrame } from '@/components/screens/preview/preview-frame'
import type { PreviewModule, PreviewRenderProps } from '@/components/screens/preview/types'
import { previewText } from '@/scn/preview-values'
import { ScnAlert } from '@/scn/widgets'

const definition = {
  id: 'alert',
  name: 'Alert',
  description: 'Aviso em destaque',
  icon: TriangleAlertIcon,
  size: { width: 280, height: 88 },
} as const

export function AlertPreview(props: PreviewRenderProps) {
  return (
    <PreviewFrame definition={definition} {...props}>
      {props.values?.title ? (
        <ScnAlert
          body={previewText(props.values, 'message', '')}
          destructive={props.values.variant === 'destructive'}
          title={previewText(props.values, 'title', 'Warning')}
        />
      ) : (
        <div style={{ display: 'grid', gap: 8, width: '100%' }}>
          <ScnAlert body="Something needs your review." title="Warning" />
          <ScnAlert body="Could not save." destructive title="Error" />
        </div>
      )}
    </PreviewFrame>
  )
}

export const alertPreview = {
  definition,
  Preview: AlertPreview,
} satisfies PreviewModule
