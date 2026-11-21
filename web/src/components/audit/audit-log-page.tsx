import { useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'

import { api, type AuditAction, type AuditRecord } from '@/lib/api'
import { reportApiError } from '@/lib/report-api-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const filters: { value: '' | AuditAction; label: string }[] = [
  { value: '', label: 'Tudo' },
  { value: 'screen.created', label: 'Criações' },
  { value: 'screen.published', label: 'Publicações' },
  { value: 'screen.deleted', label: 'Exclusões' },
]

const actionStyle: Record<
  AuditAction,
  { icon: typeof PlusIcon; bubble: string; label: string }
> = {
  'screen.created': {
    icon: PlusIcon,
    bubble: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    label: 'Criou',
  },
  'screen.published': {
    icon: PencilIcon,
    bubble: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
    label: 'Publicou',
  },
  'screen.deleted': {
    icon: Trash2Icon,
    bubble: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    label: 'Apagou',
  },
}

export function AuditLogPage() {
  const [action, setAction] = useState<'' | AuditAction>('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AuditRecord[]>([])
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .audit(page, action)
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setPageCount(result.pageCount)
        setTotal(result.total)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        reportApiError(error, 'Não foi possível carregar o registro de auditoria')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [action, page])

  const groups = groupByDay(items)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registro de auditoria</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total === 0
              ? 'Nenhuma alteração registrada ainda.'
              : `${total} ${total === 1 ? 'registro' : 'registros'} do que aconteceu no CMS.`}
          </p>
        </div>
        <Select
          value={action || 'all'}
          onValueChange={(value) => {
            setPage(1)
            setOpenId(null)
            setAction(value === 'all' ? '' : (value as AuditAction))
          }}
        >
          <SelectTrigger aria-label="Filtrar o registro" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter.label} value={filter.value || 'all'}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando o registro…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
          Nada neste filtro. Crie ou publique uma tela para o registro começar.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                {group.label}
              </h2>
              <ol className="bg-card overflow-hidden rounded-xl border">
                {group.items.map((entry, index) => (
                  <AuditRow
                    key={entry.id}
                    entry={entry}
                    open={openId === entry.id}
                    divider={index > 0}
                    onToggle={() =>
                      setOpenId((current) => (current === entry.id ? null : entry.id))
                    }
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground text-xs">
            Página {page} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </main>
  )
}

function AuditRow({
  entry,
  open,
  divider,
  onToggle,
}: {
  entry: AuditRecord
  open: boolean
  divider: boolean
  onToggle: () => void
}) {
  const style = actionStyle[entry.action]
  const Icon = style.icon
  return (
    <li className={cn(divider && 'border-t')}>
      <button
        type="button"
        className="hover:bg-muted/60 flex w-full items-start gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span
          className={cn(
            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
            style.bubble,
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-5">
            <span className="font-semibold">{style.label}</span>{' '}
            <span className="text-foreground">{entry.entityName}</span>
          </span>
          <span className="text-muted-foreground mt-0.5 block text-xs leading-4">
            {entry.summary}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {entry.version ? <Badge variant="secondary">{entry.version}</Badge> : null}
          <time className="text-muted-foreground text-xs" dateTime={entry.createdAt}>
            {formatTime(entry.createdAt)}
          </time>
          <ChevronDownIcon
            className={cn('text-muted-foreground size-4 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>
      {open ? <AuditDetails entry={entry} /> : null}
    </li>
  )
}

function AuditDetails({ entry }: { entry: AuditRecord }) {
  const payload = entry.payload
  const rows = detailRows(payload)
  const rainbow = typeof payload.rainbow === 'string' ? payload.rainbow : null
  return (
    <div className="bg-muted/40 border-t px-4 py-3 pl-16 text-sm">
      <dl className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-muted-foreground text-xs">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      {rainbow ? (
        <pre className="bg-background mt-3 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-xs leading-5">
          {rainbow}
        </pre>
      ) : null}
    </div>
  )
}

function detailRows(payload: Record<string, unknown>) {
  const rows: { label: string; value: string }[] = []
  const text = (label: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return
    if (typeof value === 'boolean') rows.push({ label, value: value ? 'sim' : 'não' })
    else if (typeof value === 'string' || typeof value === 'number') {
      rows.push({ label, value: String(value) })
    } else if (Array.isArray(value)) {
      rows.push({ label, value: value.map(String).join(', ') })
    }
  }
  text('Versão anterior', payload.previousVersion)
  text('Restaurada de', payload.restoredFrom)
  text('Nome anterior', payload.previousName)
  text('Nome', payload.name)
  text('Descrição', payload.description)
  text('Tela raiz', payload.isRoot)
  text('Revisão', payload.revision)
  text('Rainbow alterado', payload.rainbowChanged)
  text('Versões que existiam', payload.versions)
  return rows
}

function groupByDay(items: AuditRecord[]) {
  const groups: { label: string; items: AuditRecord[] }[] = []
  for (const item of items) {
    const label = dayLabel(item.createdAt)
    const last = groups.at(-1)
    if (!last || last.label !== label) groups.push({ label, items: [item] })
    else last.items.push(item)
  }
  return groups
}

function dayLabel(iso: string) {
  const date = new Date(iso)
  const today = startOfDay(new Date())
  const day = startOfDay(date)
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
