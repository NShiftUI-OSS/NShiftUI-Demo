import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'

import { AppShell } from '@/components/layout/app-shell'
import { PhoneAppearanceProvider } from '@/components/phones/phone-appearance'
import { PhoneDeviceProvider } from '@/components/phones/phone-device'
import { PreviewDisplayProvider } from '@/components/phones/preview-display'
import { Toaster } from '@/components/ui/sonner'

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { pathname } = useLocation()
  const isLandingPage = pathname === '/'

  return (
    <PhoneDeviceProvider>
      <PhoneAppearanceProvider>
        <PreviewDisplayProvider>
        {isLandingPage ? (
          <RouteTransition pathname={pathname}>
            <Outlet />
          </RouteTransition>
        ) : (
          <AppShell>
            <RouteTransition pathname={pathname}>
              <Outlet />
            </RouteTransition>
          </AppShell>
        )}
        <Toaster />
        </PreviewDisplayProvider>
      </PhoneAppearanceProvider>
    </PhoneDeviceProvider>
  )
}

function RouteTransition({
  children,
  pathname,
}: {
  children: ReactNode
  pathname: string
}) {
  return (
    <div
      key={pathname}
      className="animate-in fade-in-0 slide-in-from-right-2 flex h-full min-h-full w-full flex-1 flex-col duration-500 ease-out"
    >
      {children}
    </div>
  )
}
