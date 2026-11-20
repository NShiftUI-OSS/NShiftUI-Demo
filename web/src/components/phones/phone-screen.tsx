import { useTheme } from '@/components/layout/theme'
import type { HTMLAttributes, ReactNode, Ref } from 'react'

import { appleScreenBackground } from '@/components/phones/apple-screen'
import { useScnTheme } from '@/scn/theme'

export type PhoneScreenGeometry = {
  left: number
  top: number
  width: number
  height: number
  radiusH: number
  radiusV: number
}

type PhoneScreenProps = HTMLAttributes<HTMLDivElement> & {
  device: 'iphone' | 'android'
  geometry: PhoneScreenGeometry
  screenBackground?: string
  screenRef?: Ref<HTMLDivElement>
  children: ReactNode
}

export function PhoneScreen({
  device,
  geometry,
  screenBackground,
  screenRef,
  children,
  className,
  style,
  ...props
}: PhoneScreenProps) {
  const { resolvedTheme } = useTheme()
  const { preset } = useScnTheme()
  const appearance = resolvedTheme === 'light' ? 'light' : 'dark'
  const background = screenBackground ?? appleScreenBackground[appearance]
  const themed = screenBackground === undefined
  const lightScreen = isLightColor(background)

  return (
    <div
      {...props}
      ref={screenRef}
      className={`absolute z-0 flex flex-col overflow-hidden [container-type:size] ${themed ? 'scn scn-screen' : ''} ${className ?? ''}`}
      data-device={device}
      data-scn-appearance={themed ? appearance : undefined}
      data-scn-preset={themed ? preset : undefined}
      style={{
        ...style,
        left: `${geometry.left}%`,
        top: `${geometry.top}%`,
        width: `${geometry.width}%`,
        height: `${geometry.height}%`,
        borderRadius: `${geometry.radiusH}% / ${geometry.radiusV}%`,
        background: themed ? undefined : background,
        color: themed ? undefined : lightScreen ? '#000000' : '#ffffff',
      }}
    >
      <div className="scn-status pointer-events-none flex h-[7%] items-end justify-between px-[7%] pb-[1%] text-[4.2cqw] font-semibold">
        <span>9:41</span>
        <span className="text-[3.4cqw] tracking-wide">●●●</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <div
        aria-hidden
        className="pointer-events-none mx-auto mb-[2%] h-[1.2cqh] w-[32%] rounded-full"
        style={{
          background: themed ? 'currentColor' : lightScreen ? '#000000' : '#ffffff',
          opacity: 0.32,
        }}
      />
    </div>
  )
}

function isLightColor(color: string) {
  const hex = color.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return true
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 > 160
}
