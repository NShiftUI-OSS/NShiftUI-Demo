import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from '@/components/layout/theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NShiftProvider } from '@/di/nshift-provider'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NShiftProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </NShiftProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
