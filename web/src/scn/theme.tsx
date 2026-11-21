import { useTheme } from '@/components/layout/theme'
import {
  createContext,
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

export function ScnThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<ScnPresetId>('neutral')
  const value = useMemo(() => ({ preset, setPreset }), [preset])
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
  const { resolvedTheme } = useTheme()
  const appearance = resolvedTheme === 'light' ? 'light' : 'dark'

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
}: {
  onPreset?: (preset: ScnPresetId) => void
  disabled?: boolean
}) {
  const { preset, setPreset } = useScnTheme()
  return (
    <label className="flex items-center gap-2 text-xs">
      <span>Tema do telefone</span>
      <select
        aria-label="Tema do telefone"
        className="border-input bg-background h-7 rounded-md border px-2 disabled:opacity-50"
        disabled={disabled}
        value={preset}
        onChange={(event) => {
          const next = event.target.value as ScnPresetId
          setPreset(next)
          onPreset?.(next)
        }}
      >
        {scnPresets.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
    </label>
  )
}
