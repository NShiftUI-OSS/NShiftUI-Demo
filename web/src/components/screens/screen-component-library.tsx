import { useState } from 'react'

import { PluginDocModal } from '@/components/screens/plugin-doc-modal'
import { renderPreview, screenComponents } from '@/components/screens/preview'
import type { ScreenComponentDefinition } from '@/components/screens/preview/types'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const libraryGroups = [
  {
    label: 'Conteúdo',
    ids: [
      'text',
      'image',
      'badge',
      'card',
      'avatar',
      'item',
      'attachment',
      'separator',
    ],
  },
  {
    label: 'Ações',
    ids: ['button', 'floating-button', 'button-group', 'tabs', 'toggle-group', 'swipe-actions', 'swipe-action'],
  },
  {
    label: 'Entrada',
    ids: [
      'search-bar',
      'input',
      'textarea',
      'input-otp',
      'field',
      'select',
      'checkbox',
      'radio',
      'switch',
      'slider',
      'calendar',
    ],
  },
  {
    label: 'Avisos',
    ids: ['alert', 'progress', 'skeleton', 'spinner'],
  },
  {
    label: 'Layout',
    ids: [
      'container',
      'vertical-stack',
      'for-each',
      'horizontal-stack',
      'layer-stack',
      'vertical-scroll',
      'horizontal-scroll',
      'vertical-list',
      'horizontal-list',
    ],
  },
  {
    label: 'Navegação',
    ids: ['tab-bar', 'tab'],
  },
] as const

export function ScreenComponentLibrary({ open }: { open: boolean }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const visibleComponents = screenComponents.filter((component) =>
    `${component.name} ${component.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  const selected = screenComponents.find((component) => component.id === selectedId) ?? null

  return (
    <>
      {open ? (
        <ExpandedLibrary
          components={visibleComponents}
          search={search}
          onOpen={setSelectedId}
          onSearchChange={setSearch}
        />
      ) : (
        <CollapsedLibrary onOpen={setSelectedId} />
      )}
      <PluginDocModal component={selected} onClose={() => setSelectedId(null)} />
    </>
  )
}

function ExpandedLibrary({
  components,
  search,
  onOpen,
  onSearchChange,
}: {
  components: typeof screenComponents
  search: string
  onOpen: (id: string) => void
  onSearchChange: (value: string) => void
}) {
  const groups = groupComponents(components)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 py-3">
        <p className="text-sm font-medium">Plugins</p>
        <p className="text-muted-foreground mt-1 text-[11px] leading-4">
          Documentação de cada plugin. A tela é montada no editor Rainbow.
        </p>
        <Input
          className="bg-background mt-2 h-8"
          placeholder="Buscar plugin..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p className="text-muted-foreground mt-2 text-[11px]">
          {components.length === 0
            ? 'Nenhum plugin com esse nome.'
            : `${components.length} plugins`}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {groups.map((group) => (
          <section key={group.label} className="mb-3">
            <h2 className="bg-sidebar text-sidebar-foreground/70 sticky top-0 z-10 px-1 py-1.5 text-[11px] font-medium tracking-wide uppercase">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.items.map((component) => (
                <LibraryCard key={component.id} component={component} onOpen={onOpen} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LibraryCard({
  component,
  onOpen,
}: {
  component: ScreenComponentDefinition
  onOpen: (id: string) => void
}) {
  const Icon = component.icon

  return (
    <button
      type="button"
      aria-label={`Documentação de ${component.name}`}
      className="bg-card hover:border-foreground/30 w-full overflow-hidden rounded-lg border text-left shadow-sm"
      onClick={() => onOpen(component.id)}
    >
      <span className="flex items-start gap-2 border-b px-2.5 py-2">
        <span className="bg-muted text-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{component.name}</span>
          <span className="text-muted-foreground block truncate text-xs">
            {component.description}
          </span>
        </span>
      </span>
      <span className="bg-background/70 pointer-events-none block px-2 py-2">
        {renderPreview(component.id, { sizing: 'fill', catalog: true })}
      </span>
    </button>
  )
}

function CollapsedLibrary({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2">
      {screenComponents.map((component) => {
        const { id, name, icon: Icon } = component
        return (
          <button
            key={id}
            type="button"
            className={cn(
              'hover:bg-sidebar-accent flex size-8 items-center justify-center rounded-md transition-colors',
            )}
            title={name}
            aria-label={`Documentação de ${name}`}
            onClick={() => onOpen(id)}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

function groupComponents(components: ScreenComponentDefinition[]) {
  const byId = new Map(components.map((component) => [component.id, component]))
  const used = new Set<string>()
  const groups: { label: string; items: ScreenComponentDefinition[] }[] =
    libraryGroups.flatMap((group) => {
      const items = group.ids.flatMap((id) => {
        const item = byId.get(id)
        if (!item) return []
        used.add(id)
        return [item]
      })
      return items.length > 0 ? [{ label: group.label, items }] : []
    })
  const rest = components.filter((component) => !used.has(component.id))
  if (rest.length > 0) groups.push({ label: 'Outros', items: rest })
  return groups
}
