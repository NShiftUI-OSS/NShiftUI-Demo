import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from '@/components/layout/theme'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      size="icon"
      variant="outline"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
