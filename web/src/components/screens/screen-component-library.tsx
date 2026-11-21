import { useState } from 'react'

import { renderPreview, screenComponents } from '@/components/screens/preview'
import type { ScreenComponentDefinition } from '@/components/screens/preview/types'
import { usePreviewDisplay } from '@/components/phones/preview-display'
import { useScreenLayout } from '@/components/screens/screen-layout-context'
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
    ids: ['button', 'button-group', 'tabs', 'toggle-group'],
  },
  {
    label: 'Entrada',
    ids: [
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
      'horizontal-stack',
      'layer-stack',
      'vertical-scroll',
      'horizontal-scroll',
      'vertical-list',
      'horizontal-list',
    ],
  },
] as const

export function ScreenComponentLibrary({ open }: { open: boolean }) {
  const [search, setSearch] = useState('')

  const visibleComponents = screenComponents.filter((component) =>
    `${component.name} ${component.description}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return open ? (
    <ExpandedLibrary
      components={visibleComponents}
      search={search}
      onSearchChange={setSearch}
    />
  ) : (
    <CollapsedLibrary />
  )
}

function ExpandedLibrary({
  components,
  search,
  onSearchChange,
}: {
  components: typeof screenComponents
  search: string
  onSearchChange: (value: string) => void
}) {
  const groups = groupComponents(components)
  const { mode } = usePreviewDisplay()
  const simulation = mode === 'simulation'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-3 py-2">
        <Input
          className="bg-background h-8"
          placeholder="Buscar plugin..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p className="text-muted-foreground mt-2 text-[11px]">
          {components.length === 0
            ? 'Nenhum plugin com esse nome.'
            : simulation
              ? 'Simulação ligada: o telefone não recebe plugins.'
              : `${components.length} plugins · arraste o card para o telefone`}
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
                <LibraryCard key={component.id} component={component} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LibraryCard({ component }: { component: ScreenComponentDefinition }) {
  const {
    activeDrag,
    startLibraryDrag,
    startNativeLibraryDrag,
    handleNativeDragEnd,
  } = useScreenLayout()
  const { mode } = usePreviewDisplay()
  const simulation = mode === 'simulation'
  const selected = Boolean(
    activeDrag && !activeDrag.nodeId && activeDrag.componentId === component.id,
  )
  const Icon = component.icon

  return (
    <article
      draggable={!simulation}
      aria-grabbed={selected}
      aria-label={component.name}
      className={cn(
        'bg-card overflow-hidden rounded-lg border shadow-sm',
        simulation ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
        selected
          ? 'border-primary ring-primary/40 ring-2'
          : 'border-border hover:border-foreground/30',
      )}
      onPointerDown={simulation ? undefined : (event) => startLibraryDrag(component, event)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'copy'
        event.dataTransfer.setData('text/plain', component.id)
        startNativeLibraryDrag(component)
      }}
      onDragEnd={handleNativeDragEnd}
    >
      <header className="flex items-start gap-2 border-b px-2.5 py-2">
        <span className="bg-muted text-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{component.name}</span>
            {selected && (
              <span className="text-primary shrink-0 text-[10px] font-medium">
                Selecionado
              </span>
            )}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {component.description}
          </span>
        </span>
      </header>
      <div className="bg-background/70 px-2 py-2">
        {renderPreview(component.id, { sizing: 'fill', catalog: true })}
      </div>
    </article>
  )
}

function CollapsedLibrary() {
  const { startLibraryDrag, startNativeLibraryDrag, handleNativeDragEnd, activeDrag } =
    useScreenLayout()
  const { mode } = usePreviewDisplay()
  const simulation = mode === 'simulation'

  return (
    <div className="flex flex-col items-center gap-1 p-2">
      {screenComponents.map((component) => {
        const { id, name, icon: Icon } = component
        const selected = Boolean(
          activeDrag && !activeDrag.nodeId && activeDrag.componentId === id,
        )
        return (
          <button
            key={id}
            type="button"
            draggable={!simulation}
            aria-pressed={selected}
            className={cn(
              'hover:bg-sidebar-accent flex size-8 items-center justify-center rounded-md transition-colors',
              simulation ? 'cursor-default' : 'cursor-grab',
              selected && 'bg-primary/15 text-primary ring-primary ring-1',
            )}
            title={name}
            aria-label={name}
            onPointerDown={simulation ? undefined : (event) => startLibraryDrag(component, event)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'copy'
              event.dataTransfer.setData('text/plain', component.id)
              startNativeLibraryDrag(component)
            }}
            onDragEnd={handleNativeDragEnd}
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
