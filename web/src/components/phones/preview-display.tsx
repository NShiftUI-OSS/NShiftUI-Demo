import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

const STORAGE_KEY = 'nshift.preview-display'

export type PreviewDisplayMode = 'debug' | 'simulation'

type PreviewDisplayContextValue = {
  mode: PreviewDisplayMode
  setMode: (mode: PreviewDisplayMode) => void
}

const PreviewDisplayContext = createContext<PreviewDisplayContextValue | null>(null)

function readMode(): PreviewDisplayMode {
  if (typeof window === 'undefined') return 'debug'
  return window.localStorage.getItem(STORAGE_KEY) === 'simulation' ? 'simulation' : 'debug'
}

export function PreviewDisplayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PreviewDisplayMode>(readMode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  return (
    <PreviewDisplayContext.Provider value={{ mode, setMode }}>
      {children}
    </PreviewDisplayContext.Provider>
  )
}

export function usePreviewDisplay() {
  const value = useContext(PreviewDisplayContext)
  if (!value) {
    throw new Error('usePreviewDisplay must be used within PreviewDisplayProvider')
  }
  return value
}

export function usePreviewAssist(catalog = false) {
  const { mode } = usePreviewDisplay()
  return catalog || mode === 'debug'
}

const modes: {
  value: PreviewDisplayMode
  label: string
  track: string
  labelClass: string
  selected: string
  idle: string
  focus: string
}[] = [
  {
    value: 'debug',
    label: 'Debug',
    track: 'bg-amber-500/15 ring-amber-500/35',
    labelClass: 'text-amber-800 dark:text-amber-200',
    selected: 'bg-amber-500 text-amber-950',
    idle: 'text-amber-900/75 hover:text-amber-950 dark:text-amber-100/70 dark:hover:text-amber-50',
    focus: 'focus-visible:ring-amber-400',
  },
  {
    value: 'simulation',
    label: 'Simulação',
    track: 'bg-sky-500/15 ring-sky-500/35',
    labelClass: 'text-sky-800 dark:text-sky-200',
    selected: 'bg-sky-500 text-sky-950',
    idle: 'text-sky-900/75 hover:text-sky-950 dark:text-sky-100/70 dark:hover:text-sky-50',
    focus: 'focus-visible:ring-sky-400',
  },
]

export function PreviewDisplayToggle() {
  const { mode, setMode } = usePreviewDisplay()
  const palette = modes.find((item) => item.value === mode) ?? modes[0]

  return (
    <div
      className={cn('flex items-center gap-2 rounded-lg px-1.5 py-1 ring-1', palette.track)}
      role="group"
      aria-label="Modo de exibição"
    >
      <span className={cn('pl-1 text-xs font-medium', palette.labelClass)}>Exibição</span>
      <div className="flex">
        {modes.map((item) => (
          <button
            key={item.value}
            aria-pressed={mode === item.value}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium outline-none focus-visible:ring-2',
              palette.focus,
              mode === item.value ? palette.selected : palette.idle,
            )}
            type="button"
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
