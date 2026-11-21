import { Link, useLocation } from '@tanstack/react-router'

import { NShiftMark } from '@/components/layout/nshift-mark'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { PhoneAppearanceToggle } from '@/components/phones/phone-appearance'
import { PhoneDeviceToggle } from '@/components/phones/phone-device'
import { PreviewDisplayToggle } from '@/components/phones/preview-display'

function showsPreviewControls(pathname: string) {
  if (pathname === '/storyboard' || pathname === '/contents') return true
  return pathname.startsWith('/contents/') && pathname !== '/contents/new'
}

export function AppHeader() {
  const { pathname } = useLocation()
  const preview = showsPreviewControls(pathname)

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur">
      <Link to="/" className="flex items-center gap-2.5 font-semibold">
        <NShiftMark className="size-8" />
        <span>NShiftUI</span>
      </Link>
      <div className="flex items-center gap-3">
        {preview ? (
          <div className="flex items-center gap-3" data-preview-controls="">
            <PhoneDeviceToggle />
            <div className="bg-border h-6 w-px" />
            <PreviewDisplayToggle />
            <div className="bg-border h-6 w-px" />
            <PhoneAppearanceToggle />
            <div className="bg-border h-6 w-px" />
          </div>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
