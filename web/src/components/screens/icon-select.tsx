import { useMemo, useState } from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { scnIcons, isScnIcon } from '@/scn/icons'
import { ScnIconMark } from '@/scn/scn-icon'

const visibleLimit = 40

export function IconSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? scnIcons.filter((name) => name.includes(needle))
      : scnIcons
    const limited = filtered.slice(0, visibleLimit)
    if (value && isScnIcon(value) && !limited.includes(value)) {
      return [value, ...limited]
    }
    return limited
  }, [query, value])

  return (
    <Combobox
      value={value || null}
      onValueChange={(next) => onChange(next ?? '')}
      onInputValueChange={setQuery}
    >
      <ComboboxInput
        id={id}
        placeholder="Buscar ícone"
        showClear
        className="w-full"
      />
      <ComboboxContent className="z-[80]">
        {matches.length === 0 ? (
          <p className="text-muted-foreground px-2 py-2 text-center text-sm">
            Nenhum ícone com esse nome.
          </p>
        ) : null}
        <ComboboxList>
          {matches.map((name) => (
            <ComboboxItem key={name} value={name}>
              <ScnIconMark name={name} />
              <span className="truncate">{name}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
