import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { useScreenLayout } from '@/components/screens/screen-layout-context'
import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import { ScnIconMark } from '@/scn/scn-icon'
import { readScreenChrome, type ScreenChrome } from '@/scn/screen-theme'

const apiBase = import.meta.env.VITE_API_URL ?? 'https://127.0.0.1:3000'

export function ScreenTabBar({
  node,
  device,
  interactive,
  onChrome,
}: {
  node: ScreenLayoutNode
  device: 'iphone' | 'android'
  interactive: boolean
  onChrome: (chrome: ScreenChrome | null) => void
}) {
  const { openPluginAction, startComponentDrag } = useScreenLayout()
  const tabs = node.children
  const [selected, setSelected] = useState(0)
  const route = tabs[selected] ? text(tabs[selected], 'route') : ''

  useEffect(() => {
    let cancelled = false
    if (!route || selected === 0) {
      onChrome(null)
      return
    }
    void fetch(`${apiBase}/runtime/screens/${encodeURIComponent(route)}`)
      .then((response) => response.json())
      .then((body: { data?: { rainbow?: string } }) => {
        if (cancelled) return
        const rainbow = body.data?.rainbow
        onChrome(rainbow ? readScreenChrome(rainbow) : null)
      })
      .catch(() => {
        if (!cancelled) onChrome(null)
      })
    return () => {
      cancelled = true
    }
  }, [onChrome, route, selected])

  return (
    <div
      className={device === 'iphone' ? 'shrink-0 px-[4cqw] pb-[1.5cqw]' : 'shrink-0'}
      data-drop-target={interactive ? '' : undefined}
      data-drop-target-id={interactive ? node.id : undefined}
      onClick={
        interactive
          ? (event) => {
              if ((event.target as HTMLElement).closest('[data-layout-node]')) return
              openPluginAction({ nodeId: node.id, componentId: 'tab-bar' })
            }
          : undefined
      }
    >
      {device === 'iphone' ? (
        <IphoneGlass
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          interactive={interactive}
          onTabPointerDown={startComponentDrag}
        />
      ) : (
        <AndroidBar
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          interactive={interactive}
          onTabPointerDown={startComponentDrag}
        />
      )}
    </div>
  )
}

function IphoneGlass({
  tabs,
  selected,
  onSelect,
  interactive,
  onTabPointerDown,
}: {
  tabs: ScreenLayoutNode[]
  selected: number
  onSelect: (index: number) => void
  interactive: boolean
  onTabPointerDown: (node: ScreenLayoutNode, event: ReactPointerEvent) => void
}) {
  return (
    <div className="ios-tab-glass flex items-end justify-around gap-1 rounded-[1.6rem] px-1.5 py-1">
      {tabs.length === 0 ? (
        <span className="text-muted-foreground w-full py-3 text-center text-[10px]">
          Solte as abas aqui
        </span>
      ) : (
        tabs.map((tab, index) => (
            <GlassTab
            key={tab.id}
            tab={tab}
            selected={index === selected}
            onSelect={() => onSelect(index)}
            interactive={interactive}
            onPointerDown={onTabPointerDown}
          />
        ))
      )}
    </div>
  )
}

function GlassTab({
  tab,
  selected,
  onSelect,
  interactive,
  onPointerDown,
}: {
  tab: ScreenLayoutNode
  selected: boolean
  onSelect: () => void
  interactive: boolean
  onPointerDown: (node: ScreenLayoutNode, event: ReactPointerEvent) => void
}) {
  const title = text(tab, 'title') || 'Aba'
  const icon = text(tab, 'icon')
  return (
    <button
      type="button"
      data-layout-node={tab.id}
      className="ios-tab-glass-item flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1"
      data-selected={selected ? 'true' : 'false'}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onPointerDown={interactive ? (event) => onPointerDown(tab, event) : undefined}
    >
      {icon ? <ScnIconMark name={icon} size={17} /> : null}
      <span className="max-w-full truncate text-[9px] leading-none font-medium">{title}</span>
    </button>
  )
}

function AndroidBar({
  tabs,
  selected,
  onSelect,
  interactive,
  onTabPointerDown,
}: {
  tabs: ScreenLayoutNode[]
  selected: number
  onSelect: (index: number) => void
  interactive: boolean
  onTabPointerDown: (node: ScreenLayoutNode, event: ReactPointerEvent) => void
}) {
  return (
    <div className="bg-background flex h-14 items-stretch border-t">
      {tabs.length === 0 ? (
        <span className="text-muted-foreground flex w-full items-center justify-center text-[10px]">
          Solte as abas aqui
        </span>
      ) : (
        tabs.map((tab, index) => {
          const title = text(tab, 'title') || 'Aba'
          const icon = text(tab, 'icon')
          const active = index === selected
          return (
            <button
              key={tab.id}
              type="button"
              data-layout-node={tab.id}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
              style={{ color: active ? 'var(--scn-primary)' : 'var(--scn-muted-foreground)' }}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(index)
              }}
              onPointerDown={interactive ? (event) => onTabPointerDown(tab, event) : undefined}
            >
              {icon ? <ScnIconMark name={icon} size={18} /> : null}
              <span className="max-w-full truncate text-[10px] leading-none">{title}</span>
            </button>
          )
        })
      )}
    </div>
  )
}

function text(node: ScreenLayoutNode, key: string) {
  const value = node.props?.[key]
  return typeof value === 'string' ? value : ''
}
