import { useState, type ReactNode } from 'react'
import {
  BookOpenIcon,
  HomeIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  WorkflowIcon,
} from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'

import { AppSidebar, AppSidebarHeader } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { ScreenComponentLibrary } from '@/components/screens/screen-component-library'
import {
  ScreenLayoutProvider,
  useScreenLayout,
} from '@/components/screens/screen-layout-context'
import { ScnThemeProvider } from '@/scn/theme'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Início', to: '/', icon: HomeIcon },
  { label: 'Screens', to: '/contents', icon: LayoutDashboardIcon },
  { label: 'Storyboard', to: '/storyboard', icon: WorkflowIcon },
  { label: 'Auditoria', to: '/audit', icon: ScrollTextIcon },
  { label: 'Documentação', to: '/docs', icon: BookOpenIcon },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ScnThemeProvider>
      <ScreenLayoutProvider>
        <ShellFrame>{children}</ShellFrame>
      </ScreenLayoutProvider>
    </ScnThemeProvider>
  )
}

function ShellFrame({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const { flowFocus } = useScreenLayout()
  const { pathname } = useLocation()
  const isScreenEditor =
    pathname.startsWith('/contents/') && pathname !== '/contents/new'
  const isStoryboard = pathname === '/storyboard'
  const showPluginCatalog = isScreenEditor && !flowFocus

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <AppSidebar side="left" open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map(({ label, to, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        to === '/' ? pathname === '/' : pathname.startsWith(to)
                      }
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </AppSidebar>
      <SidebarInset
        className={cn(
          'min-w-0 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transition-[padding]',
          showPluginCatalog &&
            (rightSidebarOpen ? 'lg:pr-80' : 'lg:pr-(--sidebar-width-icon)'),
        )}
      >
        <div className="bg-background/95 supports-backdrop-filter:bg-background/80 relative z-10 shrink-0 backdrop-blur">
          <AppHeader />
        </div>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
            isStoryboard
              ? 'overflow-hidden'
              : 'overflow-x-hidden overflow-y-auto',
          )}
        >
          {children}
        </div>
      </SidebarInset>
      {showPluginCatalog && (
        <AppSidebar
          side="right"
          open={rightSidebarOpen}
          onOpenChange={setRightSidebarOpen}
        >
          <ScreenComponentLibrary open={rightSidebarOpen} />
        </AppSidebar>
      )}
    </SidebarProvider>
  )
}
