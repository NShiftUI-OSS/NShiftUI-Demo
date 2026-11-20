import { useEffect, useState } from 'react'

import {
  PhoneSelectionView,
  PREVIEW_PHONE_HEIGHT_CLASS,
  type PhoneSelection,
} from '@/components/phones/phone-device'
import { Android } from '@/components/ui/android'
import { Iphone } from '@/components/ui/iphone'
import { renderPreview } from '@/components/screens/preview'
import { ScreenFrame } from '@/components/screens/preview/screen-frame'
import { layoutFromRainbow } from '@/components/screens/rainbow-source'
import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import { useNShift } from '@/di/nshift-provider'
import { readScreenChrome, readScreenTheme } from '@/scn/screen-theme'
import { ScnThemeScope } from '@/scn/theme'

export const SCREEN_PREVIEW_PHONE_CLASS = `${PREVIEW_PHONE_HEIGHT_CLASS} w-auto shrink-0`

export function ScreenRainbowPreview({
  rainbow,
  className = SCREEN_PREVIEW_PHONE_CLASS,
}: {
  rainbow: string
  className?: string
}) {
  const preset = readScreenTheme(rainbow) ?? 'neutral'

  return (
    <ScnThemeScope preset={preset}>
      <PhoneSelectionView>
        {(selection) => {
          const device = selectedDevice(selection)
          if (!device) return null
          const Frame = device === 'iphone' ? Iphone : Android
          return (
            <Frame className={className}>
              <RainbowPreviewBody rainbow={rainbow} device={device} />
            </Frame>
          )
        }}
      </PhoneSelectionView>
    </ScnThemeScope>
  )
}

function selectedDevice(selection: PhoneSelection): 'iphone' | 'android' | null {
  if (selection.iphone) return 'iphone'
  if (selection.android) return 'android'
  return null
}

function RainbowPreviewBody({
  rainbow,
  device,
}: {
  rainbow: string
  device: 'iphone' | 'android'
}) {
  const container = useNShift()
  const [nodes, setNodes] = useState<ScreenLayoutNode[] | null>(null)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    let cancelled = false
    setNodes(null)
    setInvalid(false)
    void container.parser.parse(rainbow).then((parsed) => {
      if (cancelled) return
      const layout = layoutFromRainbow(parsed)
      if (!layout) {
        setInvalid(true)
        return
      }
      setNodes(layout)
    })
    return () => {
      cancelled = true
    }
  }, [container.parser, rainbow])

  return (
    <ScreenFrame chrome={readScreenChrome(rainbow)} device={device} interactive={false}>
      <div className="phone-scroll pointer-events-none relative flex min-h-0 w-full flex-1 flex-col">
        {invalid ? (
          <PreviewMessage>Preview indisponível</PreviewMessage>
        ) : nodes === null ? (
          <PreviewMessage>Carregando…</PreviewMessage>
        ) : nodes.length === 0 ? (
          <PreviewMessage>Tela vazia</PreviewMessage>
        ) : (
          <div className="flex min-h-full w-full shrink-0 flex-col items-stretch justify-center">
            {nodes.map((node) => (
              <div key={node.id} className="w-full">
                <PreviewNode node={node} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenFrame>
  )
}

function PreviewNode({
  node,
  sizing = 'fill',
}: {
  node: ScreenLayoutNode
  sizing?: 'fill' | 'intrinsic'
}) {
  return renderPreview(node.componentId, {
    sizing,
    values: node.props,
    nodes: node.children,
    interactive: false,
    className: 'pointer-events-none',
    renderNode: (child, childSizing) => (
      <PreviewNode node={child as ScreenLayoutNode} sizing={childSizing} />
    ),
  })
}

function PreviewMessage({ children }: { children: string }) {
  return (
    <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center px-5 text-center text-[10px]">
      {children}
    </div>
  )
}
