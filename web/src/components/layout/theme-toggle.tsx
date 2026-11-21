import { flushSync } from 'react-dom'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from '@/components/layout/theme'

import { Button } from '@/components/ui/button'

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  function revealTheme() {
    const next = isDark ? 'light' : 'dark'
    const apply = () => flushSync(() => setTheme(next))
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = (document as ViewTransitionDocument).startViewTransition
    if (motion || !start) {
      apply()
      return
    }
    document.documentElement.dataset.themeReveal = 'center'
    start.call(document, apply).finished.finally(() => {
      delete document.documentElement.dataset.themeReveal
    })
  }

  return (
    <Button
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      size="icon"
      variant="outline"
      onClick={revealTheme}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
