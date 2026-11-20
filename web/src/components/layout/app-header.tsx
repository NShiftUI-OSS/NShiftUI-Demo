import { Link } from '@tanstack/react-router'

import { NShiftMark } from '@/components/layout/nshift-mark'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur">
      <Link to="/" className="flex items-center gap-2.5 font-semibold">
        <NShiftMark className="size-8" />
        <span>NShiftUI</span>
      </Link>
      <ThemeToggle />
    </header>
  )
}
