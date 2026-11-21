import { useTheme } from '@/components/layout/theme'
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

const STORAGE_KEY = 'nshift.phone-appearance'

export type PhoneAppearance = 'light' | 'dark'

type PhoneAppearanceValue = {
  appearance: PhoneAppearance
  setAppearance: (appearance: PhoneAppearance) => void
}

const PhoneAppearanceContext = createContext<PhoneAppearanceValue | null>(null)
const InsidePhoneContext = createContext(false)

function readAppearance(): PhoneAppearance {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

export function PhoneAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<PhoneAppearance>(readAppearance)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, appearance)
  }, [appearance])

  return (
    <PhoneAppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </PhoneAppearanceContext.Provider>
  )
}

export function InsidePhone({ children }: { children: ReactNode }) {
  return <InsidePhoneContext.Provider value={true}>{children}</InsidePhoneContext.Provider>
}

export function usePhoneAppearance() {
  const value = useContext(PhoneAppearanceContext)
  if (!value) {
    return {
      appearance: 'dark' as const,
      setAppearance: () => undefined,
    }
  }
  return value
}

export function useResolvedScnAppearance(): PhoneAppearance {
  const insidePhone = useContext(InsidePhoneContext)
  const { appearance } = usePhoneAppearance()
  const { resolvedTheme } = useTheme()
  if (insidePhone) return appearance
  return resolvedTheme === 'light' ? 'light' : 'dark'
}

const options: {
  value: PhoneAppearance
  label: string
  track: string
  labelClass: string
  pill: string
  selected: string
  idle: string
  focus: string
}[] = [
  {
    value: 'light',
    label: 'Claro',
    track: 'bg-emerald-500/15 ring-emerald-500/35',
    labelClass: 'text-emerald-800 dark:text-emerald-200',
    pill: 'bg-emerald-500',
    selected: 'text-emerald-950',
    idle: 'text-emerald-900/75 hover:text-emerald-950 dark:text-emerald-100/70 dark:hover:text-emerald-50',
    focus: 'focus-visible:ring-emerald-400',
  },
  {
    value: 'dark',
    label: 'Escuro',
    track: 'bg-violet-500/15 ring-violet-500/35',
    labelClass: 'text-violet-800 dark:text-violet-200',
    pill: 'bg-violet-500',
    selected: 'text-violet-950',
    idle: 'text-violet-900/75 hover:text-violet-950 dark:text-violet-100/70 dark:hover:text-violet-50',
    focus: 'focus-visible:ring-violet-400',
  },
]

export function PhoneAppearanceToggle() {
  const { appearance, setAppearance } = usePhoneAppearance()
  const palette = options.find((item) => item.value === appearance) ?? options[1]
  const groupRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ x: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    const measure = () => {
      const selected = group.querySelector<HTMLElement>('[data-appearance-selected="true"]')
      if (!selected) return
      setPill({ x: selected.offsetLeft, width: selected.offsetWidth, ready: true })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => observer.disconnect()
  }, [appearance])

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-1.5 py-1 ring-1 transition-[background-color,box-shadow,color] duration-300',
        palette.track,
      )}
      role="group"
      aria-label="Tema do Telefone"
    >
      <span className={cn('pl-1 text-xs font-medium transition-colors duration-300', palette.labelClass)}>
        Tema do Telefone
      </span>
      <div ref={groupRef} className="relative flex">
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-0 left-0 h-full rounded-md transition-[transform,width,background-color] duration-300 ease-out',
            palette.pill,
            pill.ready ? 'opacity-100' : 'opacity-0',
          )}
          style={{ width: pill.width, transform: `translateX(${pill.x}px)` }}
        />
        {options.map((item) => {
          const selected = appearance === item.value
          return (
            <button
              key={item.value}
              aria-pressed={selected}
              data-appearance-selected={selected}
              className={cn(
                'relative z-10 rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors duration-300 focus-visible:ring-2',
                palette.focus,
                selected ? palette.selected : palette.idle,
              )}
              type="button"
              onClick={() => setAppearance(item.value)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
