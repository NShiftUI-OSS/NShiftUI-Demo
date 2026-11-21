import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ThemeName = 'light' | 'dark' | 'system'

type ThemeValue = {
  theme: ThemeName
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeName) => void
}

const storageKey = 'theme'
const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(readStoredTheme)
  const [systemDark, setSystemDark] = useState(readSystemDark)
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setSystemDark(query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    localStorage.setItem(storageKey, theme)
  }, [resolvedTheme, theme])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) {
    return {
      theme: 'system' as const,
      resolvedTheme: 'dark' as const,
      setTheme: () => undefined,
    }
  }
  return value
}

function readStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    return 'system'
  }
  return 'system'
}

function readSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
