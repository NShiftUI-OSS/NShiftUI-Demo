import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import { ScnIconMark } from '@/scn/scn-icon'

export function ScreenTabBar({
  node,
  device,
}: {
  node: ScreenLayoutNode
  device: 'iphone' | 'android'
  interactive?: boolean
  onChrome?: (chrome: null) => void
}) {
  const tabs = node.children

  return (
    <div
      className={
        device === 'iphone'
          ? 'pointer-events-none absolute inset-x-0 bottom-0 z-10 px-[4cqw] pb-[1.5cqw]'
          : 'pointer-events-none shrink-0'
      }
    >
      {device === 'iphone' ? <IphoneGlass tabs={tabs} /> : <AndroidBar tabs={tabs} />}
    </div>
  )
}

function IphoneGlass({ tabs }: { tabs: ScreenLayoutNode[] }) {
  if (tabs.length === 0) return null
  return (
    <div className="ios-tab-glass flex items-end justify-around gap-1 rounded-[1.6rem] px-1.5 py-1">
      {tabs.map((tab, index) => (
        <GlassTab key={tab.id} tab={tab} selected={index === 0} />
      ))}
    </div>
  )
}

function GlassTab({ tab, selected }: { tab: ScreenLayoutNode; selected: boolean }) {
  const title = text(tab, 'title') || 'Aba'
  const icon = text(tab, 'icon')
  return (
    <div
      className="ios-tab-glass-item flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1"
      data-selected={selected ? 'true' : 'false'}
    >
      {icon ? <ScnIconMark name={icon} size={17} /> : null}
      <span className="max-w-full truncate text-[9px] leading-none font-medium">{title}</span>
    </div>
  )
}

function AndroidBar({ tabs }: { tabs: ScreenLayoutNode[] }) {
  if (tabs.length === 0) return null
  return (
    <div
      data-android-tab-bar=""
      className="flex h-14 items-stretch border-t border-[var(--scn-border)] bg-[var(--scn-background)]"
    >
      {tabs.map((tab, index) => {
        const title = text(tab, 'title') || 'Aba'
        const icon = text(tab, 'icon')
        const active = index === 0
        return (
          <div
            key={tab.id}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
            style={{ color: active ? 'var(--scn-primary)' : 'var(--scn-muted-foreground)' }}
          >
            {icon ? (
              <span
                className="flex h-6 w-10 items-center justify-center rounded-full"
                style={active ? { backgroundColor: 'var(--scn-muted)' } : undefined}
              >
                <ScnIconMark name={icon} size={18} />
              </span>
            ) : null}
            <span className="max-w-full truncate text-[10px] leading-none">{title}</span>
          </div>
        )
      })}
    </div>
  )
}

function text(node: ScreenLayoutNode, key: string) {
  const value = node.props?.[key]
  return typeof value === 'string' ? value : ''
}
