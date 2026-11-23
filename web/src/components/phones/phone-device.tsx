import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from '@tanstack/react-router'

import { Android } from '@/components/ui/android'
import { Button } from '@/components/ui/button'
import { Iphone, type IphoneProps } from '@/components/ui/iphone'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'nshift.phone-flows'
const LEGACY_KEY = 'nshift.phone-devices'

export const PREVIEW_PHONE_HEIGHT_CLASS = 'h-(--preview-phone-height)'

export function previewPhoneHeight() {
  if (typeof document === 'undefined') return 720
  const probe = document.createElement('div')
  probe.className = PREVIEW_PHONE_HEIGHT_CLASS
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  document.body.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return Math.round(height) || 720
}

export type PhoneSelection = {
  iphone: boolean
  android: boolean
}

type PhoneFlow = 'screens' | 'storyboard' | 'preview'

type FlowSelections = Record<PhoneFlow, PhoneSelection>

type PhoneDeviceContextValue = {
  selection: PhoneSelection
  single: boolean
  toggle: (device: keyof PhoneSelection) => void
}

const PhoneDeviceContext = createContext<PhoneDeviceContextValue | null>(null)

function flowOf(pathname: string): PhoneFlow | null {
  if (pathname === '/storyboard') return 'storyboard'
  if (pathname === '/contents') return 'screens'
  if (pathname.startsWith('/contents/') && pathname !== '/contents/new') return 'preview'
  return null
}

function oneDevice(selection: PhoneSelection): PhoneSelection {
  if (selection.iphone) return { iphone: true, android: false }
  if (selection.android) return { iphone: false, android: true }
  return { iphone: true, android: false }
}

function atLeastOne(selection: PhoneSelection): PhoneSelection {
  if (selection.iphone || selection.android) return selection
  return { iphone: true, android: true }
}

function isSelection(value: unknown): value is PhoneSelection {
  if (!value || typeof value !== 'object') return false
  const parsed = value as Partial<PhoneSelection>
  return typeof parsed.iphone === 'boolean' && typeof parsed.android === 'boolean'
}

function readLegacy(): PhoneSelection {
  const raw = window.localStorage.getItem(LEGACY_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (isSelection(parsed)) return parsed
    } catch {
      // Ignore a broken saved value and use the default below.
    }
  }
  const older = window.localStorage.getItem('nshift.phone-device')
  if (older === 'android') return { iphone: false, android: true }
  if (older === 'iphone') return { iphone: true, android: false }
  return { iphone: true, android: true }
}

function readFlows(): FlowSelections {
  const fallback = typeof window === 'undefined' ? { iphone: true, android: true } : readLegacy()
  const empty: FlowSelections = {
    screens: oneDevice(fallback),
    storyboard: oneDevice(fallback),
    preview: atLeastOne(fallback),
  }
  if (typeof window === 'undefined') return empty
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return empty
  try {
    const parsed = JSON.parse(raw) as Partial<Record<PhoneFlow, unknown>>
    return {
      screens: isSelection(parsed.screens) ? oneDevice(parsed.screens) : empty.screens,
      storyboard: isSelection(parsed.storyboard) ? oneDevice(parsed.storyboard) : empty.storyboard,
      preview: isSelection(parsed.preview) ? atLeastOne(parsed.preview) : empty.preview,
    }
  } catch {
    return empty
  }
}

export function PhoneDeviceProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const flow = flowOf(pathname)
  const [flows, setFlows] = useState<FlowSelections>(readFlows)
  const selection = flow ? flows[flow] : flows.preview

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flows))
  }, [flows])

  function toggle(device: keyof PhoneSelection) {
    if (!flow) return
    setFlows((current) => {
      const selected = current[flow]
      const next =
        flow === 'preview'
          ? togglePreview(selected, device)
          : { iphone: device === 'iphone', android: device === 'android' }
      if (next.iphone === selected.iphone && next.android === selected.android) return current
      return { ...current, [flow]: next }
    })
  }

  return (
    <PhoneDeviceContext.Provider value={{ selection, single: flow !== 'preview', toggle }}>
      {children}
    </PhoneDeviceContext.Provider>
  )
}

function togglePreview(current: PhoneSelection, device: keyof PhoneSelection): PhoneSelection {
  const next = { ...current, [device]: !current[device] }
  if (!next.iphone && !next.android) return current
  return next
}

function usePhoneDevice() {
  const value = useContext(PhoneDeviceContext)
  if (!value) {
    throw new Error('usePhoneDevice must be used within PhoneDeviceProvider')
  }
  return value
}

export function PhoneSelectionView({
  children,
}: {
  children: (selection: PhoneSelection) => ReactNode
}) {
  const { selection } = usePhoneDevice()
  return children(selection)
}

export function PhoneFrame(props: IphoneProps) {
  const { selection } = usePhoneDevice()
  if (selection.iphone) return <Iphone {...props} />
  if (selection.android) return <Android {...props} />
  return null
}

export function PhoneDeviceToggle() {
  const { selection, single, toggle } = usePhoneDevice()

  return (
    <div className="flex items-center gap-1">
      <Button
        aria-label={single ? 'iPhone' : selection.iphone ? 'Ocultar iPhone' : 'Mostrar iPhone'}
        aria-pressed={selection.iphone}
        size="icon"
        title="iPhone"
        type="button"
        variant="ghost"
        className={cn(
          selection.iphone
            ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'text-muted-foreground',
        )}
        onClick={() => toggle('iphone')}
      >
        <AppleMark />
      </Button>
      <Button
        aria-label={single ? 'Android' : selection.android ? 'Ocultar Android' : 'Mostrar Android'}
        aria-pressed={selection.android}
        size="icon"
        title="Android"
        type="button"
        variant="ghost"
        className={cn(
          selection.android
            ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'text-muted-foreground',
        )}
        onClick={() => toggle('android')}
      >
        <AndroidMark />
      </Button>
    </div>
  )
}

function AppleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M16.37 12.72c.03 2.52 2.21 3.36 2.24 3.37-.02.06-.35 1.2-1.15 2.37-.7 1.02-1.42 2.04-2.56 2.06-1.12.02-1.48-.66-2.76-.66s-1.68.64-2.74.68c-1.1.04-1.94-1.1-2.64-2.12-1.44-2.08-2.54-5.88-1.06-8.44.73-1.27 2.04-2.08 3.46-2.1 1.08-.02 2.1.73 2.76.73.66 0 1.9-.9 3.2-.77.54.02 2.07.22 3.05 1.66-.08.05-1.82 1.06-1.8 3.16ZM14.7 6.3c.58-.7 1-1.68.89-2.65-.86.04-1.9.57-2.52 1.28-.55.64-1.04 1.66-.91 2.63.96.08 1.94-.49 2.54-1.26Z" />
    </svg>
  )
}

function AndroidMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M17.6 9.48 19.44 6.3c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18.56h22a10.78 10.78 0 0 0-5.4-9.08ZM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
    </svg>
  )
}
