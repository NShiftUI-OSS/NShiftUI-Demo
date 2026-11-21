import type { CSSProperties, ReactNode } from 'react'

import { usePreviewAssist } from '@/components/phones/preview-display'
import { useScreenLayout } from '@/components/screens/screen-layout-context'
import { cn } from '@/lib/utils'
import { ScnIconMark } from '@/scn/scn-icon'
import {
  navigationBarVisible,
  type ScreenChrome,
} from '@/scn/screen-theme'

export function ScreenFrame({
  chrome,
  device,
  children,
  interactive = true,
}: {
  chrome: ScreenChrome | null
  device: 'iphone' | 'android'
  children: ReactNode
  interactive?: boolean
}) {
  const { openPluginAction } = useScreenLayout()
  const assist = usePreviewAssist()
  if (!chrome) return children

  return (
    <div
      data-preview-assist={assist ? 'debug' : 'simulation'}
      className={cn(
        'flex min-h-0 w-full flex-1 flex-col bg-transparent',
        assist && 'preview-assist-line border border-dashed',
      )}
      onClick={
        interactive
          ? (event) => {
              if ((event.target as HTMLElement).closest('[data-layout-node]')) return
              openPluginAction({ nodeId: 'screen', componentId: 'nshift-screen' })
            }
          : undefined
      }
    >
      {navigationBarVisible(chrome) ? (
        <ScreenNavBar chrome={chrome} device={device} />
      ) : null}
      {children}
    </div>
  )
}

function ScreenNavBar({
  chrome,
  device,
}: {
  chrome: ScreenChrome
  device: 'iphone' | 'android'
}) {
  return device === 'android' ? (
    <AndroidBar chrome={chrome} />
  ) : (
    <IphoneBar chrome={chrome} />
  )
}

function IphoneBar({ chrome }: { chrome: ScreenChrome }) {
  const leading = leadingIcon(chrome)
  const trailing = trailingIcon(chrome)
  const side = Math.max(leading ? 60 : 0, trailing ? 60 : 0)

  return (
    <div data-screen-nav="iphone" style={barShell(chrome, 44)}>
      <div style={{ position: 'relative', height: 44 }}>
        {leading ? <IphoneSlot side="left" name={leading} /> : null}
        {trailing ? <IphoneSlot side="right" name={trailing} /> : null}
        {chrome.navigationCenterIcon ? (
          <span style={centerSlot(44)}>
            <BarGlyph name={chrome.navigationCenterIcon} size={20} />
          </span>
        ) : chrome.title ? (
          <span
            style={{
              display: 'flex',
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: side,
              paddingRight: side,
              fontSize: 17,
              fontWeight: 600,
              lineHeight: '22px',
            }}
          >
            <span style={ellipsis}>{chrome.title}</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

function AndroidBar({ chrome }: { chrome: ScreenChrome }) {
  const leading = leadingIcon(chrome)
  const trailing = trailingIcon(chrome)

  return (
    <div data-screen-nav="android" style={barShell(chrome, 64)}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        {leading ? <AndroidSlot name={leading} /> : null}
        {!chrome.navigationCenterIcon ? (
          <span
            style={{
              ...ellipsis,
              paddingLeft: leading ? 0 : 12,
              fontSize: 22,
              fontWeight: 400,
              lineHeight: '28px',
            }}
          >
            {chrome.title}
          </span>
        ) : (
          <span style={centerSlot(64)}>
            <BarGlyph name={chrome.navigationCenterIcon} size={24} />
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'flex' }}>
          {trailing ? <AndroidSlot name={trailing} /> : null}
        </span>
      </div>
    </div>
  )
}

function IphoneSlot({ side, name }: { side: 'left' | 'right'; name: string }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: 0,
        [side]: 16,
        display: 'flex',
        height: 44,
        alignItems: 'center',
      }}
    >
      <BarGlyph name={name} size={20} />
    </span>
  )
}

function AndroidSlot({ name }: { name: string }) {
  return (
    <span
      style={{
        display: 'flex',
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BarGlyph name={name} size={24} />
    </span>
  )
}

function BarGlyph({ name, size }: { name: string; size: number }) {
  return <ScnIconMark name={name} size={size} />
}

function leadingIcon(chrome: ScreenChrome) {
  if (chrome.navigationLeadingIcon) return chrome.navigationLeadingIcon
  if (chrome.navigationLeading === 'back') return 'arrow-left'
  return null
}

function trailingIcon(chrome: ScreenChrome) {
  if (chrome.navigationTrailingIcon) return chrome.navigationTrailingIcon
  if (chrome.navigationTrailing === 'close') return 'x'
  return null
}

function barShell(chrome: ScreenChrome, height: number): CSSProperties {
  const token = chrome.navigationBackground || 'background'
  const color = `var(--scn-${token})`
  return {
    position: 'relative',
    height,
    flexShrink: 0,
    color: 'var(--scn-foreground)',
    background: color,
  }
}

function centerSlot(height: number): CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    display: 'flex',
    height,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  }
}

const ellipsis: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
