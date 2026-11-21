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
    track: 'bg-stone-200/20 ring-stone-300/45',
    labelClass: 'text-stone-700 dark:text-stone-200',
    pill: 'bg-stone-100',
    selected: 'text-stone-950',
    idle: 'text-stone-700/80 hover:text-stone-950 dark:text-stone-200/75 dark:hover:text-stone-50',
    focus: 'focus-visible:ring-stone-300',
  },
  {
    value: 'dark',
    label: 'Escuro',
    track: 'bg-slate-500/20 ring-slate-400/45',
    labelClass: 'text-slate-700 dark:text-slate-200',
    pill: 'bg-slate-700',
    selected: 'text-slate-50',
    idle: 'text-slate-700/80 hover:text-slate-950 dark:text-slate-200/75 dark:hover:text-slate-50',
    focus: 'focus-visible:ring-slate-400',
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
