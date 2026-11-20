import type { ReactNode } from 'react'
import { PanelLeftIcon, PanelRightIcon } from 'lucide-react'

import { Sidebar, SidebarHeader, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const sidebarMotion =
  'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transition-[width]'

type AppSidebarProps = {
  side: 'left' | 'right'
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function AppSidebar({
  side,
  open,
  onOpenChange,
  children,
}: AppSidebarProps) {
  if (side === 'left') {
    return <Sidebar collapsible="icon">{children}</Sidebar>
  }

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground fixed inset-y-0 right-0 z-20 hidden h-svh shrink-0 flex-col overflow-hidden border-l lg:flex',
        sidebarMotion,
        open ? 'w-80' : 'w-(--sidebar-width-icon)',
      )}
    >
      <button
        type="button"
        aria-label={open ? 'Fechar sidebar' : 'Expandir sidebar'}
        className="hover:bg-sidebar-accent flex h-14 w-full shrink-0 items-center justify-center border-b transition-colors"
        onClick={() => onOpenChange(!open)}
      >
        <PanelRightIcon className="size-4" />
      </button>
      {children}
    </aside>
  )
}

export function AppSidebarHeader() {
  const { state, toggleSidebar } = useSidebar()
  const expanded = state === 'expanded'

  return (
    <SidebarHeader className="border-sidebar-border h-14 border-b p-0">
      <button
        type="button"
        aria-label={expanded ? 'Fechar sidebar' : 'Expandir sidebar'}
        className="hover:bg-sidebar-accent flex size-full items-center justify-center transition-colors"
        onClick={toggleSidebar}
      >
        <PanelLeftIcon className="size-4" />
      </button>
    </SidebarHeader>
  )
}
