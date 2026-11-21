import { usePhoneAppearance, useResolvedScnAppearance } from '@/components/phones/phone-appearance'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { scnPresets, type ScnPresetId } from '@/scn/presets'

import './components.css'
import './themes.css'

type ScnThemeValue = {
  preset: ScnPresetId
  setPreset: (preset: ScnPresetId) => void
}

const ScnThemeContext = createContext<ScnThemeValue | null>(null)
const previewStorageKey = 'scn.preview.preset'

function readPreviewPreset(): ScnPresetId {
  if (typeof window === 'undefined') return 'neutral'
  const raw = window.localStorage.getItem(previewStorageKey)
  return scnPresets.some((item) => item.id === raw) ? (raw as ScnPresetId) : 'neutral'
}

export function ScnThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<ScnPresetId>(readPreviewPreset)
  const setPreset = useCallback((next: ScnPresetId) => {
    setPresetState(next)
    window.localStorage.setItem(previewStorageKey, next)
  }, [])
  const value = useMemo(() => ({ preset, setPreset }), [preset, setPreset])
  return (
    <ScnThemeContext.Provider value={value}>{children}</ScnThemeContext.Provider>
  )
}

/** Pins a preset for one phone. Does not write the editor's shared theme. */
export function ScnThemeScope({
  preset,
  children,
}: {
  preset: ScnPresetId
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      preset,
      setPreset: () => undefined,
    }),
    [preset],
  )
  return (
    <ScnThemeContext.Provider value={value}>{children}</ScnThemeContext.Provider>
  )
}

export function useScnTheme() {
  const value = useContext(ScnThemeContext)
  if (!value) {
    return {
      preset: 'neutral' as ScnPresetId,
      setPreset: () => undefined,
    }
  }
  return value
}

export function ScnRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { preset } = useScnTheme()
  const appearance = useResolvedScnAppearance()

  return (
    <div
      className={className ? `scn ${className}` : 'scn'}
      data-scn-appearance={appearance}
      data-scn-preset={preset}
    >
      {children}
    </div>
  )
}

export function ScnPresetSelect({
  onPreset,
  disabled = false,
  label = 'Tema do Design System',
}: {
  onPreset?: (preset: ScnPresetId) => void
  disabled?: boolean
  label?: string
}) {
  const { preset, setPreset } = useScnTheme()
  const { appearance } = usePhoneAppearance()
  const current = scnPresets.find((item) => item.id === preset) ?? scnPresets[0]

  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <Select
        disabled={disabled}
        value={current.id}
        onValueChange={(next) => {
          const id = next as ScnPresetId
          setPreset(id)
          onPreset?.(id)
        }}
      >
        <SelectTrigger aria-label="Tema do Design System" className="w-32" size="sm">
          <SelectValue />
        </SelectTrigger>
          <SelectContent
            align="end"
            className="scn-theme-menu max-h-72"
            position="popper"
          >
            {scnPresets.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <ThemeSwatch appearance={appearance} id={item.id} />
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
    </label>
  )
}

function ThemeSwatch({
  id,
  appearance,
}: {
  id: ScnPresetId
  appearance: 'light' | 'dark'
}) {
  return (
    <span
      aria-hidden="true"
      className="scn scn-theme-swatch-host"
      data-scn-appearance={appearance}
      data-scn-preset={id}
    >
      <span className="scn-theme-swatch" />
    </span>
  )
}
