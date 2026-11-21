import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useTheme } from '@/components/layout/theme'
import { renderPreview } from '@/components/screens/preview'
import { pluginRainbowExample } from '@/components/screens/plugin-example'
import type { ScreenComponentDefinition } from '@/components/screens/preview/types'
import { highlightRainbow } from '@/components/screens/rainbow-highlight'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fieldsFor, pluginStyleFields, type PluginField } from '@/scn/plugin-fields'

const darkColors = {
  use: '#C4B5FD',
  plugin: '#D0A8FF',
  punctuation: '#9CA3AF',
  version: '#F472B6',
  event: '#F1B467',
  trigger: '#FC6B83',
  parameter: '#D0A8FF',
  string: '#FF9A3C',
  escape: '#FFB86C',
  number: '#B5CEA8',
  boolean: '#E879F9',
  null: '#FB7185',
  identifier: '#22D3EE',
  placeholder: '#67E8F9',
  comment: '#6B7280',
  conflict: '#F87171',
  embedded: '#FBBF24',
  text: '#E5E7EB',
} as const

const lightColors = {
  use: '#7C3AED',
  plugin: '#8040D0',
  punctuation: '#6B7280',
  version: '#DB2777',
  event: '#C08532',
  trigger: '#CF2D56',
  parameter: '#8040D0',
  string: '#E86A17',
  escape: '#C2410C',
  number: '#098658',
  boolean: '#A21CAF',
  null: '#E11D48',
  identifier: '#0891B2',
  placeholder: '#0E7490',
  comment: '#6B7280',
  conflict: '#DC2626',
  embedded: '#D97706',
  text: '#111827',
} as const

export function PluginDocModal({
  component,
  onClose,
}: {
  component: ScreenComponentDefinition | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={Boolean(component)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      {component ? (
        <PluginDocBody key={component.id} component={component} />
      ) : null}
    </Dialog>
  )
}

function PluginDocBody({ component }: { component: ScreenComponentDefinition }) {
  const example = pluginRainbowExample(component)
  const fields = fieldsFor(component.id)
  const Icon = component.icon
  const sample =
    component.acceptsChildren
      ? [
          {
            id: 'sample',
            componentId: component.id === 'tab-bar' ? 'tab' : 'text',
            children: [],
          },
        ]
      : undefined

  return (
    <DialogContent
      className="!inset-3 !h-auto !w-auto !max-w-none !translate-none grid grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:!max-w-none"
      data-plugin-doc={component.id}
      style={{
        top: '0.75rem',
        right: '0.75rem',
        bottom: '0.75rem',
        left: '0.75rem',
        width: 'auto',
        height: 'auto',
        maxWidth: 'none',
        transform: 'none',
        animation: 'none',
        opacity: 1,
        zIndex: 80,
      }}
    >
      <DialogHeader className="shrink-0 gap-1 border-b px-6 py-4 pr-14 text-left">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <span className="bg-muted flex size-8 items-center justify-center rounded-md">
            <Icon className="size-4" />
          </span>
          {component.name}
        </DialogTitle>
        <DialogDescription>{component.description}</DialogDescription>
      </DialogHeader>
      <div className="grid min-h-0 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
        <section className="min-h-0 space-y-6 border-b p-6 lg:overflow-y-auto lg:border-r lg:border-b-0">
          <div>
            <h2 className="text-sm font-medium">Para que serve</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {purpose(component)} O exemplo ao lado pode ser copiado e colado no
              editor Rainbow da tela. A montagem continua nesse editor.
            </p>
          </div>
          <figure className="bg-muted/40 overflow-hidden rounded-xl border">
            <div className="flex min-h-48 items-center justify-center px-6 py-8">
              <div className="w-full max-w-sm">
                {renderPreview(component.id, {
                  catalog: true,
                  sizing: 'fill',
                  values: previewValues(component.id),
                  nodes: sample,
                  renderNode: (node) =>
                    renderPreview(node.componentId, {
                      sizing: 'fill',
                      values:
                        node.componentId === 'text'
                          ? { text: 'Conteúdo' }
                          : node.componentId === 'tab'
                            ? { title: 'Aba', icon: 'house' }
                            : undefined,
                    }),
                })}
              </div>
            </div>
            <figcaption className="text-muted-foreground border-t px-4 py-2 text-xs">
              Aparência no preview
            </figcaption>
          </figure>
          <div>
            <h2 className="text-sm font-medium">Parâmetros</h2>
            {fields.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Este plugin não declara parâmetros próprios.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {fields.map((field) => (
                  <ParameterCard key={field.name} field={field} />
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-sm font-medium">Estilo</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              O bloco <code className="text-foreground">.style()</code> é compartilhado
              por todos os plugins. Cada campo abaixo edita uma parte dessa aparência.
            </p>
            <ul className="mt-3 grid gap-3">
              {pluginStyleFields.map((field) => (
                <ParameterCard key={field.name} field={field} />
              ))}
            </ul>
          </div>
        </section>
        <ExampleEditor example={example} />
      </div>
    </DialogContent>
  )
}

function ParameterCard({ field }: { field: PluginField }) {
  return (
    <li className="rounded-lg border px-3 py-2.5">
      <p className="text-sm font-medium">{field.label}</p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">{edits(field)}</p>
      <p className="text-muted-foreground mt-1 font-mono text-[11px]">
        {field.name}
        {field.defaultValue ? ` · exemplo ${field.defaultValue}` : ''}
      </p>
    </li>
  )
}

function ExampleEditor({ example }: { example: string }) {
  const { resolvedTheme } = useTheme()
  const colors = resolvedTheme === 'light' ? lightColors : darkColors
  const tokens = highlightRainbow(example)
  const lineCount = example.split('\n').length
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(example)
      setCopied(true)
      toast.success('Exemplo copiado')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Não foi possível copiar. Selecione o exemplo no editor.')
    }
  }

  return (
    <section className="bg-card flex min-h-[24rem] flex-col lg:min-h-0">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div>
          <p className="text-sm font-medium">Exemplo Rainbow</p>
          <p className="text-muted-foreground text-[11px]">
            Somente leitura. Copie e cole no editor da tela.
          </p>
        </div>
        <Button size="sm" type="button" variant="outline" onClick={() => void copy()}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copiado' : 'Copiar exemplo'}
        </Button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div
          aria-hidden
          className="text-muted-foreground w-12 shrink-0 overflow-hidden border-r pt-4 pr-2 text-right font-mono text-[13px] leading-6 select-none"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <pre
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-[13px] leading-6 whitespace-pre"
          >
            {tokens.map((token, index) => (
              <span key={index} style={{ color: colors[token.color] }}>
                {token.text}
              </span>
            ))}
          </pre>
          <textarea
            aria-label="Exemplo Rainbow"
            className="absolute inset-0 resize-none overflow-auto border-0 bg-transparent p-4 font-mono text-[13px] leading-6 whitespace-pre text-transparent caret-transparent outline-none"
            readOnly
            spellCheck={false}
            value={example}
            onScroll={(event) => {
              const backdrop = event.currentTarget.previousElementSibling
              if (backdrop instanceof HTMLElement) {
                backdrop.scrollTop = event.currentTarget.scrollTop
                backdrop.scrollLeft = event.currentTarget.scrollLeft
              }
            }}
          />
        </div>
      </div>
    </section>
  )
}

function purpose(component: ScreenComponentDefinition) {
  if (component.acceptsChildren) {
    return `${component.description}. Ele recebe outros plugins dentro do bloco.`
  }
  return `${component.description}.`
}

function edits(field: PluginField) {
  const base = `Edita ${field.label.charAt(0).toLowerCase()}${field.label.slice(1)}.`
  if (field.kind === 'select' && field.options?.length) {
    return `${base} Opções: ${field.options.filter(Boolean).join(', ')}.`
  }
  if (field.kind === 'boolean') return `${base} Use true ou false.`
  if (field.kind === 'list') return `${base} No Rainbow, os itens formam um array.`
  if (field.kind === 'icon') return `${base} Informe o nome do ícone.`
  if (field.kind === 'number') return `${base} O valor é um número.`
  return base
}

function previewValues(id: string) {
  const values: Record<string, string | number | boolean | string[]> = {}
  for (const field of fieldsFor(id)) {
    if (field.kind === 'boolean') {
      values[field.name] = field.defaultValue === 'true'
    } else if (field.kind === 'number' && field.defaultValue.trim()) {
      const parsed = Number(field.defaultValue)
      if (Number.isFinite(parsed)) values[field.name] = parsed
    } else if (field.kind === 'list') {
      const items = field.defaultValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      if (items.length > 0) values[field.name] = items
    } else if (field.defaultValue) {
      values[field.name] = field.defaultValue
    }
  }
  return values
}
