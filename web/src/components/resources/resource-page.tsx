import { useEffect, useState } from 'react'
import { PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { api, type ScreenPage } from '@/lib/api'
import { reportApiError } from '@/lib/report-api-error'
import { ScreenCard } from '@/components/resources/screen-card'
import { ScreenList } from '@/components/resources/screen-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { defaultWebViewSource, type RootContainer } from '@/components/screens/rainbow-document'

type Resource = {
  id: string
  name: string
  description: string
  rainbow: string
  meta: string
  isRoot: boolean
}

export function ResourcePage() {
  const navigate = useNavigate()
  const [pageData, setPageData] = useState<ScreenPage | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isRoot, setIsRoot] = useState(false)
  const [containerKind, setContainerKind] = useState<RootContainer>('Screen')
  const [webURL, setWebURL] = useState('https://')
  const visibleResources = (pageData?.items ?? []).map((screen) => ({
    id: screen.id,
    name: screen.name,
    description: screen.description,
    rainbow: screen.rainbow,
    meta: screen.version,
    isRoot: screen.isRoot,
  }))
  const pageCount = pageData?.pageCount ?? 1
  const currentPage = pageData?.page ?? page
  const pageSize = pageData?.pageSize ?? 4
  const total = pageData?.total ?? 0

  useEffect(() => {
    let cancelled = false
    api
      .screens(page, search)
      .then((result) => {
        if (cancelled) return
        if (result.page !== page) {
          setPage(result.page)
          return
        }
        setPageData(result)
      })
      .catch((error: unknown) => {
        if (!cancelled) reportApiError(error, 'Não foi possível carregar os dados')
      })
    return () => {
      cancelled = true
    }
  }, [page, search])

  function openCreate() {
    setEditing(null)
    setConfirmDelete(false)
    setName('')
    setDescription('')
    setIsRoot(false)
    setContainerKind('Screen')
    setWebURL('https://')
    setOpen(true)
  }

  async function refresh() {
    const result = await api.screens(page, search)
    if (result.page !== page) {
      setPage(result.page)
      return
    }
    setPageData(result)
  }

  async function saveResource() {
    if (!name.trim()) return
    try {
      if (editing) {
        const current = await api.screen(editing.id)
        await api.updateScreen(editing.id, {
          name,
          description,
          rainbow: current.rainbow,
          revision: current.revision,
          isRoot,
        })
      } else {
        await api.createScreen({
          name,
          description,
          isRoot,
          // A WebView starts from its page; a Screen from the backend's empty screen.
          rainbow: containerKind === 'WebView' ? defaultWebViewSource(name.trim(), webURL.trim()) : undefined,
        })
      }
      await refresh()
      setOpen(false)
    } catch (error) {
      reportApiError(error, 'Não foi possível salvar')
    }
  }

  async function removeEditingResource() {
    if (!editing) return
    try {
      await api.deleteScreen(editing.id)
      await refresh()
      setConfirmDelete(false)
      setEditing(null)
      setOpen(false)
    } catch (error) {
      reportApiError(error, 'Não foi possível excluir')
    }
  }

  return (
    <main className="w-full space-y-8 p-6 pb-28 lg:p-10 lg:pb-32">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Badge variant="outline">Screens</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Screens</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Organize as telas que compõem suas experiências mobile.
          </p>
        </div>
        <span className="text-muted-foreground text-sm">{total} itens cadastrados</span>
      </div>

      <div className="relative max-w-md">
        <SearchIcon className="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input
          className="pl-9"
          placeholder="Buscar screens..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <ScreenList>
        {visibleResources.map((resource) => (
          <ScreenCard
            key={resource.id}
            name={resource.name}
            description={resource.description}
            rainbow={resource.rainbow}
            onClick={() =>
              navigate({
                to: '/contents/$contentId',
                params: { contentId: resource.id },
              })
            }
            isRoot={resource.isRoot}
          />
        ))}
      </ScreenList>

      <Button className="fixed right-6 bottom-6 z-20 h-12 rounded-full px-5 shadow-lg" onClick={openCreate}>
        <PlusIcon />
        Nova screen
      </Button>

      <div className="flex flex-col justify-between gap-3 border-t pt-5 pr-48 text-sm sm:flex-row sm:items-center">
        <span className="text-muted-foreground">
          Página {currentPage} de {pageCount} · {visibleResources.length} de {total} itens · {pageSize} por página
        </span>
        <div className="flex gap-2">
          <Button
            disabled={currentPage === 1}
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <Button
            disabled={currentPage >= pageCount}
            variant="outline"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) setConfirmDelete(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar screen' : 'Cadastrar screen'}</DialogTitle>
            <DialogDescription>O nome é o identificador da tela, como home.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="screen-name">Nome</Label>
              <Input id="screen-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="screen-description">Descrição</Label>
              <Textarea
                id="screen-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            {!editing && (
              <div className="grid gap-2">
                <Label>Plugin container</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={containerKind}
                  onValueChange={(value) => {
                    if (value) setContainerKind(value as RootContainer)
                  }}
                >
                  <ToggleGroupItem value="Screen">Screen</ToggleGroupItem>
                  <ToggleGroupItem value="WebView">WebView</ToggleGroupItem>
                </ToggleGroup>
                <p className="text-muted-foreground text-xs">
                  {containerKind === 'Screen'
                    ? 'Uma tela nativa montada com os plugins do design system.'
                    : 'Uma página web com a barra de navegação do app.'}
                </p>
              </div>
            )}
            {!editing && containerKind === 'WebView' && (
              <div className="grid gap-2">
                <Label htmlFor="screen-url">Endereço da página</Label>
                <Input
                  id="screen-url"
                  placeholder="https://"
                  value={webURL}
                  onChange={(event) => setWebURL(event.target.value)}
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRoot}
                onChange={(event) => setIsRoot(event.target.checked)}
              />
              Esta é a tela root do aplicativo
            </label>
          </div>
          <DialogFooter className="gap-3 sm:justify-between">
            {editing && (
              <div className="flex flex-1 items-center gap-2">
                {confirmDelete ? (
                  <>
                    <p className="text-destructive text-xs">Essa ação não pode ser desfeita.</p>
                    <Button size="sm" variant="destructive" onClick={removeEditingResource}>
                      Excluir definitivamente
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2Icon />
                    Excluir
                  </Button>
                )}
              </div>
            )}
            {!confirmDelete && (
              <div className="flex gap-2 sm:ml-auto">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={
                    !name.trim() ||
                    (!editing && containerKind === 'WebView' && !/^https?:\/\/\S+\.\S+/.test(webURL.trim()))
                  }
                  onClick={saveResource}
                >
                  Salvar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
