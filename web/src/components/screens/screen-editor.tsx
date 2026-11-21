import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { CircleXIcon } from 'lucide-react'

import { DomainRecordDialog } from '@/components/domain/domain-record-dialog'
import { ApiError, api, type ScreenRecord, type ScreenVersion } from '@/lib/api'
import { displayScreenName } from '@/lib/display-screen-name'
import { hasMergeMarkers, mergeRainbow } from '@/lib/merge-rainbow'
import { reportApiError } from '@/lib/report-api-error'
import { PageSubheader } from '@/components/layout/page-subheader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PluginActionDialog } from '@/components/screens/plugin-action-dialog'
import { styleSpacing } from '@/components/screens/preview/plugin-chrome'
import { ScreenFrame } from '@/components/screens/preview/screen-frame'
import { readScreenChrome, readScreenTheme, writeScreenTheme } from '@/scn/screen-theme'
import { ScnPresetSelect, useScnTheme } from '@/scn/theme'
import {
  PhoneSelectionView,
  PREVIEW_PHONE_HEIGHT_CLASS,
  type PhoneSelection,
} from '@/components/phones/phone-device'
import { usePreviewDisplay } from '@/components/phones/preview-display'
import { PreviewFidelityNotice } from '@/components/preview-fidelity-notice'
import { FlowCanvas } from '@/components/screens/flow/flow-canvas'
import {
  readPlacedPlugin,
  readRainbowDocument,
} from '@/components/screens/rainbow-document'
import { RainbowEditor } from '@/components/screens/rainbow-editor'
import { Android } from '@/components/ui/android'
import { Iphone } from '@/components/ui/iphone'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { renderPreview } from '@/components/screens/preview'
import { useNShift } from '@/di/nshift-provider'
import { fieldsFor } from '@/scn/plugin-fields'
import { screenFields, sheetFields } from '@/components/screens/plugin-slots'
import { previewPluginName, type PreviewPluginId } from '@/di/registrations'
import type { PreviewSizing } from '@/components/screens/preview/types'
import {
  useScreenLayout,
  type DropGuide,
  type ScreenLayoutNode,
} from '@/components/screens/screen-layout-context'

export function ScreenEditor({ screenId }: { screenId: string }) {
  const {
    pendingPlacement,
    commitPlacement,
    cancelPlacement,
    rainbowSource,
    setRainbowSource,
    flowFocus,
    closeFlow,
    pluginAction,
    closePluginAction,
    openFlow,
    savePlacedPlugin,
    removePlaced,
    sheet,
    sheetEditToken,
  } = useScreenLayout()
  const container = useNShift()
  const { setPreset } = useScnTheme()
  const previewId = pendingPlacement?.componentId as PreviewPluginId | undefined
  const editorRowRef = useRef<HTMLDivElement>(null)
  const [editorOpen, setEditorOpen] = useState(true)
  const [editorWidth, setEditorWidth] = useState(448)
  const [evenSplit, setEvenSplit] = useState(false)
  const [screen, setScreen] = useState<ScreenRecord | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [mergeNote, setMergeNote] = useState<string | null>(null)
  const [versions, setVersions] = useState<ScreenVersion[]>([])
  const [viewedVersion, setViewedVersion] = useState<string | null>(null)
  const [pluginEdit, setPluginEdit] = useState<{
    nodeId: string
    componentId: string
    name: string
    version: string
    fields: Record<string, string>
  } | null>(null)
  const sheetRef = useRef(sheet)
  sheetRef.current = sheet
  useEffect(() => {
    const current = sheetRef.current
    if (!sheetEditToken || !current) return
    setPluginEdit({
      nodeId: 'sheet',
      componentId: 'sheet',
      name: 'Sheet',
      version: '1.0.0',
      fields: current.fields,
    })
  }, [sheetEditToken])

  const visibleScreen = screen?.id === screenId ? screen : null
  const viewedSnapshot = versions.find((item) => item.version === viewedVersion) ?? null
  const frozen = Boolean(
    visibleScreen && viewedSnapshot && viewedSnapshot.version !== visibleScreen.version,
  )
  const unpublished = Boolean(
    !frozen && visibleScreen && rainbowSource && rainbowSource !== visibleScreen.rainbow,
  )

  useEffect(() => {
    let cancelled = false
    Promise.all([api.screen(screenId), api.screenVersions(screenId)])
      .then(([record, history]) => {
        if (cancelled) return
        setRainbowSource(record.rainbow)
        setScreen(record)
        setVersions(history)
        setViewedVersion(record.version)
        setLoadError(null)
        setMergeNote(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError('Não foi possível carregar a tela')
        reportApiError(error, 'Não foi possível carregar a tela')
      })
    return () => {
      cancelled = true
    }
  }, [screenId, setRainbowSource])

  useEffect(() => {
    const theme = readScreenTheme(rainbowSource)
    if (theme) setPreset(theme)
  }, [rainbowSource, setPreset])

  const publish = useCallback(() => {
    if (!visibleScreen || publishing) return
    if (frozen) {
      if (!viewedSnapshot) return
      setPublishing(true)
      api
        .activateScreenVersion(visibleScreen.id, viewedSnapshot.version, visibleScreen.revision)
        .then((updated) => {
          setScreen(updated)
          setViewedVersion(updated.version)
          setRainbowSource(updated.rainbow)
          setMergeNote(null)
          setConfirmPublish(false)
          api.screenVersions(updated.id).then(setVersions).catch(() => undefined)
        })
        .catch((error: unknown) => {
          reportApiError(error, 'Não foi possível entregar esta versão')
        })
        .finally(() => setPublishing(false))
      return
    }
    if (!unpublished) return
    const source = rainbowSource
    setPublishing(true)
    api
      .updateScreen(visibleScreen.id, {
        name: visibleScreen.name,
        description: visibleScreen.description,
        rainbow: source,
        revision: visibleScreen.revision,
        isRoot: visibleScreen.isRoot,
      })
      .then((updated) => {
        setScreen(updated)
        setViewedVersion(updated.version)
        if (updated.rainbow !== source) setRainbowSource(updated.rainbow)
        setMergeNote(null)
        setConfirmPublish(false)
        api.screenVersions(updated.id).then(setVersions).catch(() => undefined)
      })
      .catch(async (error: unknown) => {
        if (error instanceof ApiError && error.code === 'revision_conflict') {
          try {
            const latest = await api.screen(visibleScreen.id)
            const merged = mergeRainbow(
              visibleScreen.rainbow,
              source,
              latest.rainbow,
              latest.revision,
            )
            setScreen(latest)
            setRainbowSource(merged.text)
            setEditorOpen(true)
            setConfirmPublish(false)
            setMergeNote(
              merged.conflicts > 0
                ? `A versão ${latest.version} foi publicada enquanto você editava. O editor propõe o merge: resolva cada bloco entre <<<<<<< e >>>>>>> e publique de novo.`
                : merged.text === latest.rainbow
                  ? `A versão ${latest.version} já contém o que você escreveu.`
                  : `A versão ${latest.version} foi publicada enquanto você editava. As duas alterações foram juntadas no editor. Revise o texto e publique.`,
            )
            return
          } catch (followUp: unknown) {
            reportApiError(followUp, 'Não foi possível comparar as duas versões')
            return
          }
        }
        reportApiError(error, 'Não foi possível publicar a tela')
      })
      .finally(() => setPublishing(false))
  }, [
    frozen,
    publishing,
    rainbowSource,
    setRainbowSource,
    unpublished,
    viewedSnapshot,
    visibleScreen,
  ])

  function showVersion(version: string) {
    const snapshot = versions.find((item) => item.version === version)
    if (!snapshot) return
    setViewedVersion(version)
    setRainbowSource(snapshot.rainbow)
    setMergeNote(null)
  }

  function changeEditorWidth(next: number) {
    setEvenSplit(false)
    setEditorWidth(next)
  }

  function equalizeEditor() {
    const row = editorRowRef.current
    if (!row || row.clientWidth <= 0) return
    setEditorWidth(row.clientWidth / 2)
    setEvenSplit(true)
  }

  const panesEven = editorOpen && evenSplit

  return (
    <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-muted/20">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PageSubheader
          title={visibleScreen ? displayScreenName(visibleScreen.name) : 'Carregando tela'}
          screenName={visibleScreen?.name}
          version={visibleScreen?.version}
          onBack={flowFocus ? closeFlow : undefined}
          subtitle={
            visibleScreen
              ? frozen
                ? `Olhando a versão ${viewedVersion}`
                : unpublished
                  ? `Rascunho sobre ${visibleScreen.version}`
                  : `Versão no app · ${visibleScreen.version}`
              : 'Screen editor'
          }
          actions={
            <div className="flex items-center gap-4">
              {versions.length > 0 && viewedVersion ? (
                <Select value={viewedVersion} onValueChange={showVersion}>
                  <SelectTrigger aria-label="Versão da tela" className="w-44" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((item) => (
                      <SelectItem key={item.version} value={item.version}>
                        {item.current ? `${item.version} · no app` : item.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {visibleScreen?.isRoot && <Badge variant="destructive">Root</Badge>}
              <ScnPresetSelect
                disabled={frozen}
                onPreset={(preset) => {
                  if (frozen) return
                  const next = writeScreenTheme(rainbowSource, preset)
                  if (next !== rainbowSource) setRainbowSource(next)
                }}
              />
              <label className="flex items-center gap-2 text-xs">
                <span>Editor Rainbow</span>
                <Switch
                  aria-label="Mostrar editor Rainbow"
                  checked={editorOpen}
                  onCheckedChange={setEditorOpen}
                />
              </label>
              <Button
                size="sm"
                disabled={publishing || (!frozen && (!unpublished || hasMergeMarkers(rainbowSource)))}
                onClick={() => setConfirmPublish(true)}
              >
                {frozen ? 'Usar no app' : 'Publicar'}
              </Button>
            </div>
          }
        />
        {visibleScreen ? (
          <div
            className={
              frozen
                ? 'border-b border-amber-500/40 bg-amber-500/15 px-4 py-3'
                : unpublished
                  ? 'border-b border-sky-500/30 bg-sky-500/10 px-4 py-3'
                  : 'border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-3'
            }
            data-version-status
          >
            <p className="text-sm font-medium">
              {displayScreenName(visibleScreen.name)}
              {' · '}
              {frozen ? `versão ${viewedVersion}` : `versão ${visibleScreen.version}`}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {frozen
                ? `Você está olhando uma versão antiga. Ela não pode ser editada. O aplicativo ainda recebe a ${visibleScreen.version}.`
                : unpublished
                  ? `Você está editando um rascunho. Publicar cria a próxima versão. O aplicativo ainda recebe a ${visibleScreen.version}.`
                  : 'Você está na versão que o aplicativo recebe. Editar e publicar cria uma versão nova.'}
            </p>
            {mergeNote ? <p className="mt-1 text-sm">{mergeNote}</p> : null}
          </div>
        ) : null}

        <div
          ref={editorRowRef}
          data-editor-row
          data-split={panesEven ? 'even' : 'fixed'}
          className="relative flex min-h-0 min-w-0 flex-1"
          style={
            {
              '--phone-reserve':
                'calc(min(78svh, 760px, 100svh - 9rem) * 433 / 882 + 10.5rem)',
            } as CSSProperties
          }
        >
          <div
            data-phone-slot
            className={`${
              panesEven
                ? flowFocus
                  ? 'flex w-1/2 min-w-0 shrink-0 grow-0 basis-1/2 items-stretch overflow-hidden p-4'
                  : 'flex w-1/2 min-w-0 shrink-0 grow-0 basis-1/2 items-center justify-center overflow-hidden p-6 sm:p-10'
                : flowFocus
                  ? 'flex w-0 min-w-0 grow items-stretch overflow-hidden p-4'
                  : 'flex w-0 min-w-(--phone-reserve) grow items-center justify-center overflow-hidden p-6 sm:p-10'
            }${frozen ? ' pointer-events-none' : ''}`}
          >
            {flowFocus ? (
              <FlowCanvas focus={flowFocus} />
            ) : (
              <PhonePreview />
            )}
          </div>
          <div
            data-editor-pane
            className={
              !editorOpen
                ? 'hidden'
                : panesEven
                  ? 'relative z-10 flex h-full w-1/2 min-h-0 min-w-0 shrink-0 grow-0 basis-1/2 self-stretch'
                  : 'relative z-10 flex h-full max-w-[calc(100%-var(--phone-reserve))] min-h-0 min-w-0 shrink self-stretch'
            }
            style={panesEven ? undefined : { width: editorWidth }}
          >
            {visibleScreen ? (
              <RainbowEditor
                active={editorOpen}
                initialSource={visibleScreen.rainbow}
                notice={
                  frozen
                    ? `Versão ${viewedVersion}, somente leitura. O aplicativo recebe a ${visibleScreen.version}. Usar no app troca a entrega, sem criar outra versão.`
                    : mergeNote
                }
                readOnly={frozen}
                screenId={visibleScreen.id}
                width={editorWidth}
                onClose={() => setEditorOpen(false)}
                onEqualize={equalizeEditor}
                onWidthChange={changeEditorWidth}
              />
            ) : (
              <p className="text-muted-foreground p-6 text-sm">
                {loadError ?? 'Carregando o Rainbow...'}
              </p>
            )}
          </div>
          {flowFocus ? null : <PreviewFidelityNotice />}
        </div>
      </section>
      <AlertDialog
        open={confirmPublish}
        onOpenChange={(open) => {
          if (!publishing) setConfirmPublish(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {frozen ? 'Entregar esta versão?' : 'Publicar esta tela?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {frozen
                ? `O aplicativo passa a receber a versão ${viewedVersion} de ${displayScreenName(visibleScreen?.name ?? 'esta tela')}. Nenhuma versão nova é criada, e a ${visibleScreen?.version} continua no histórico.`
                : 'Publicar cria a próxima versão. A versão que está no aplicativo agora permanece no histórico e não é alterada.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={publishing}
              onClick={(event) => {
                event.preventDefault()
                publish()
              }}
            >
              {publishing ? 'Salvando...' : frozen ? 'Usar no app' : 'Publicar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DragGhost />
      <DomainRecordDialog
        kind="plugin"
        open={Boolean(pendingPlacement)}
        title="Dados do plugin"
        description="Nome, versão e o metadata do plugin. O preview muda com esses campos."
        initial={{
          name: previewId ? previewPluginName(previewId) : '',
          version: '1.0.0',
          trigger: '',
        }}
        previewId={previewId}
        onOpenChange={(open) => {
          if (!open) cancelPlacement()
        }}
        onSubmit={(result) => {
          if (result.plugin) commitPlacement(result.plugin)
        }}
      />
      <PluginActionDialog
        action={pluginAction}
        onOpenChange={(open) => {
          if (!open) closePluginAction()
        }}
        onFlow={openFlow}
        onEdit={(action) => {
          void container.parser.parse(rainbowSource).then((parsed) => {
            const placed = readPlacedPlugin(readRainbowDocument(parsed) ?? { uses: [], nodes: [] }, action.nodeId)
            closePluginAction()
            if (!placed) return
            setPluginEdit({
              nodeId: action.nodeId,
              componentId: action.componentId,
              name: placed.name,
              version: placed.version,
              fields: placed.fields,
            })
          })
        }}
        onRemove={(action) => removePlaced(action.nodeId)}
      />
      <DomainRecordDialog
        kind="plugin"
        open={Boolean(pluginEdit)}
        title={pluginEdit?.componentId === 'sheet' ? 'Editar bottom sheet' : 'Editar plugin'}
        description={
          pluginEdit?.componentId === 'sheet'
            ? 'Título e estilo da bottom sheet. O preview mostra a sheet aberta.'
            : 'Altere os parâmetros. O preview usa esses valores.'
        }
        initial={{
          name: pluginEdit?.name ?? '',
          version: pluginEdit?.version ?? '1.0.0',
          trigger: '',
        }}
        initialMetadata={pluginEdit?.fields}
        fields={
          pluginEdit?.componentId === 'nshift-screen'
            ? screenFields
            : pluginEdit?.componentId === 'sheet'
              ? sheetFields
              : undefined
        }
        previewId={
          pluginEdit &&
          pluginEdit.componentId !== 'nshift-screen' &&
          pluginEdit.componentId !== 'sheet'
            ? (pluginEdit.componentId as PreviewPluginId)
            : undefined
        }
        showDelete={
          pluginEdit?.componentId !== 'nshift-screen' &&
          pluginEdit?.componentId !== 'sheet'
        }
        onOpenChange={(open) => {
          if (!open) setPluginEdit(null)
        }}
        onDelete={() => {
          if (!pluginEdit) return
          removePlaced(pluginEdit.nodeId)
          setPluginEdit(null)
        }}
        onSubmit={(result) => {
          if (!pluginEdit || !result.metadata) return
          const fieldNames = (
            pluginEdit.componentId === 'nshift-screen'
              ? screenFields
              : pluginEdit.componentId === 'sheet'
                ? sheetFields
                : fieldsFor(pluginEdit.componentId)
          ).map((field) => field.name)
          const sheetIdentity = pluginEdit.componentId === 'sheet'
          savePlacedPlugin(pluginEdit.nodeId, {
            name: sheetIdentity ? 'Sheet' : result.values.name,
            version: sheetIdentity ? '1.0.0' : result.values.version,
            metadata: result.metadata,
            fieldNames,
            style: result.style,
          })
          setPluginEdit(null)
        }}
      />
    </main>
  )
}

function DragGhost() {
  const { activeDrag } = useScreenLayout()
  if (!activeDrag?.started) return null

  return createPortal(
    <>
      {renderPreview(activeDrag.componentId, {
        ghost: true,
        position: { x: activeDrag.pointerX, y: activeDrag.pointerY },
        className: 'pointer-events-none z-[60] opacity-90',
      })}
      {activeDrag.dropGuide && <InsertionLine guide={activeDrag.dropGuide} />}
    </>,
    document.body,
  )
}

function InsertionLine({ guide }: { guide: DropGuide }) {
  const horizontal = guide.axis === 'x'

  return (
    <div
      className="pointer-events-none fixed z-[80]"
      style={{
        left: guide.x,
        top: guide.y,
        width: horizontal ? guide.length : 3,
        height: horizontal ? 3 : guide.length,
        transform: horizontal ? 'translateY(-50%)' : 'translateX(-50%)',
        background: '#f43f5e',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.45)',
      }}
    />
  )
}

const PHONE_HEIGHT_CLASS = PREVIEW_PHONE_HEIGHT_CLASS
const IPHONE_ASPECT = 433 / 882
const ANDROID_ASPECT = 380 / 830
const PHONE_GAP = 32
const WHEEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const WHEEL_MOTION = `transform 1100ms ${WHEEL_EASE}, filter 1100ms ${WHEEL_EASE}`

function PhonePreview() {
  return (
    <PhoneSelectionView>
      {(selection) => <PhoneStage selection={selection} />}
    </PhoneSelectionView>
  )
}

function PhoneStage({ selection }: { selection: PhoneSelection }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [sideBySide, setSideBySide] = useState(false)
  const devices = [
    selection.iphone ? 'iphone' : null,
    selection.android ? 'android' : null,
  ].filter((device): device is 'iphone' | 'android' => device !== null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const measure = () => {
      if (devices.length < 2) {
        setSideBySide(false)
        return
      }
      const previews = [
        ...stage.querySelectorAll<HTMLElement>('[data-device-preview]'),
      ]
      const height = Math.max(0, ...previews.map((phone) => phone.offsetHeight))
      if (height <= 0) return
      const needed = height * (IPHONE_ASPECT + ANDROID_ASPECT) + PHONE_GAP
      setSideBySide((current) => {
        const next = current
          ? stage.clientWidth >= needed - 64
          : stage.clientWidth >= needed + 64
        return current === next ? current : next
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    measure()
    return () => observer.disconnect()
  }, [devices.length])

  return (
    <div
      ref={stageRef}
      className="flex h-full w-full min-w-0 items-center justify-center"
      data-phone-layout={
        devices.length < 2 ? 'single' : sideBySide ? 'row' : 'wheel'
      }
    >
      {devices.length === 0 ? (
        <p className="text-muted-foreground px-6 text-center text-sm">
          Ative um aparelho no header
        </p>
      ) : devices.length === 1 || sideBySide ? (
        <div className="flex items-center justify-center gap-8">
          {devices.map((device) => (
            <DevicePreview key={device} device={device} />
          ))}
        </div>
      ) : (
        <PhoneWheel devices={devices} />
      )}
    </div>
  )
}

function PhoneWheel({ devices }: { devices: Array<'iphone' | 'android'> }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const lockRef = useRef(false)
  const [index, setIndex] = useState(0)
  const count = devices.length
  const activeIndex = Math.max(0, Math.min(index, count - 1))

  useEffect(() => {
    indexRef.current = activeIndex
  }, [activeIndex])

  const select = useCallback(
    (next: number) => {
      if (next < 0 || next >= count || next === indexRef.current) return
      lockRef.current = true
      indexRef.current = next
      setIndex(next)
      window.setTimeout(() => {
        lockRef.current = false
      }, 1200)
    },
    [count],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onWheel(event: WheelEvent) {
      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX
      if (Math.abs(delta) < 8) return
      event.preventDefault()
      if (lockRef.current) return
      select(indexRef.current + (delta > 0 ? 1 : -1))
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [select])

  return (
    <div
      ref={viewportRef}
      className="flex h-full w-full items-center justify-center gap-4"
      data-wheel-index={activeIndex}
    >
      <PhoneWheelIndicators
        activeIndex={activeIndex}
        devices={devices}
        onSelect={select}
      />
      <div
        className={`relative shrink-0 overflow-hidden ${PHONE_HEIGHT_CLASS}`}
        style={{ aspectRatio: '433 / 882', perspective: '1400px' }}
      >
        {devices.map((device, position) => {
          const selected = wheelOffset(position, activeIndex, count) === 0
          return (
            <div
              key={device}
              className="absolute inset-0 flex items-center justify-center"
              data-wheel-pose={selected ? 'selected' : 'away'}
              style={{
                transform: selected
                  ? 'rotateX(0deg) translateY(0)'
                  : 'translateY(115%) rotateX(62deg)',
                transformOrigin: 'center top',
                zIndex: selected ? 2 : 1,
                pointerEvents: selected ? 'auto' : 'none',
                transition: `transform 1100ms ${WHEEL_EASE}`,
              }}
            >
              <DevicePreview device={device} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PhoneWheelIndicators({
  devices,
  activeIndex,
  onSelect,
}: {
  devices: Array<'iphone' | 'android'>
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const count = devices.length

  return (
    <div className="relative z-30 shrink-0" style={{ perspective: '700px' }}>
      <div className="flex flex-col items-center gap-3">
        {devices.map((device, position) => {
          const offset = wheelOffset(position, activeIndex, count)
          const selected = offset === 0
          const label = device === 'iphone' ? 'iPhone' : 'Android'
          return (
            <button
              key={device}
              aria-label={
                selected ? `${label} selecionado` : `Selecionar ${label}`
              }
              aria-pressed={selected}
              className="block cursor-pointer rounded-[1.1rem] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
              style={{
                transform: selected
                  ? 'rotateX(0deg) translateZ(36px) scale(1)'
                  : 'translateY(8px) rotateX(22deg) translateZ(-48px) scale(0.86)',
                filter: selected ? 'blur(0px)' : 'blur(1.5px) brightness(0.62)',
                zIndex: selected ? 2 : 1,
                transformOrigin: selected ? 'center center' : 'top center',
                transition: WHEEL_MOTION,
              }}
              onClick={() => onSelect(position)}
            >
              <PhoneMark device={device} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PhoneMark({ device }: { device: 'iphone' | 'android' }) {
  const Frame = device === 'iphone' ? Iphone : Android
  return <Frame aria-hidden className="pointer-events-none h-24 w-auto" />
}

function wheelOffset(position: number, active: number, count: number) {
  const raw = position - active
  return raw < 0 ? raw + count : raw
}

function DevicePreview({ device }: { device: 'iphone' | 'android' }) {
  const {
    activeDrag,
    layoutNodes,
    previewError,
    rainbowSource,
    registerCanvas,
    handleNativeDragOver,
    handleNativeDrop,
    sheet,
    sheetEditor,
    closeSheetEditor,
    requestSheetEdit,
  } = useScreenLayout()
  const Frame = device === 'iphone' ? Iphone : Android

  return (
    <Frame
      data-device-preview
      className={`${PHONE_HEIGHT_CLASS} w-auto shrink-0`}
      screenRef={registerCanvas}
      data-drop-target
      data-drop-target-id="root"
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = activeDrag?.nodeId ? 'move' : 'copy'
        handleNativeDragOver(event.clientX, event.clientY)
      }}
      onDrop={(event) => {
        event.preventDefault()
        handleNativeDrop(event.clientX, event.clientY)
      }}
    >
      <ScreenFrame chrome={readScreenChrome(rainbowSource)} device={device}>
      <div
        className="phone-scroll relative flex min-h-0 w-full flex-1 flex-col"
        data-drop-target
        data-drop-target-id="root"
      >
        {hasMergeMarkers(rainbowSource) ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-xs text-neutral-500">
            O merge está no editor de texto. O preview volta quando os marcadores forem resolvidos.
          </div>
        ) : previewError ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
            <CircleXIcon
              className="size-10 fill-red-500 text-white"
              strokeWidth={1.75}
            />
            <p className="text-[15px] font-semibold text-current">
              Preview Error
            </p>
          </div>
        ) : (
          <>
            {layoutNodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-xs text-neutral-500">
                Arraste um componente para começar
              </div>
            )}
            <div className="flex min-h-full w-full shrink-0 flex-col items-stretch justify-center">
              {layoutNodes.map((node) => (
                <div key={node.id} className="w-full">
                  <LayoutNodeView node={node} />
                </div>
              ))}
            </div>
            {sheetEditor && sheet ? (
              <BottomSheetPreview
                sheet={sheet}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleNativeDragOver(event.clientX, event.clientY)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleNativeDrop(event.clientX, event.clientY)
                }}
                onClose={closeSheetEditor}
                onEdit={requestSheetEdit}
              />
            ) : null}
          </>
        )}
      </div>
      </ScreenFrame>
    </Frame>
  )
}

function BottomSheetPreview({
  sheet,
  onDragOver,
  onDrop,
  onClose,
  onEdit,
}: {
  sheet: { title: string; fields: Record<string, string>; nodes: ScreenLayoutNode[] }
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onClose: () => void
  onEdit: () => void
}) {
  const spacing = styleSpacing(sheet.fields)
  const frame = sheetFrame(sheet.fields)
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40"
      data-sheet-overlay
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="flex max-h-[78%] min-h-[42%] w-full flex-col rounded-t-[10px] bg-[var(--scn-background)] text-[var(--scn-foreground)] shadow-[0_-12px_40px_rgba(0,0,0,0.28)]"
        style={frame}
        data-drop-target
        data-drop-target-id="sheet"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex justify-center pt-2">
          <span className="h-1 w-9 rounded-full bg-[var(--scn-muted-foreground)] opacity-60" />
        </div>
        <p className="px-4 pt-3 text-center text-[17px] leading-[22px] font-semibold">
          {sheet.title}
        </p>
        <div
          className="phone-scroll flex min-h-0 flex-1 flex-col px-4 pt-3 pb-2"
          style={{ gap: spacing ?? 12 }}
        >
          {sheet.nodes.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--scn-muted-foreground)]">
              Arraste componentes para a bottom sheet
            </p>
          ) : (
            sheet.nodes.map((node) => (
              <div key={node.id} className="w-full">
                <LayoutNodeView node={node} />
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between px-4 pt-1 pb-3">
          <button type="button" className="text-xs font-medium" onClick={onEdit}>
            Editar
          </button>
          <button type="button" className="text-xs font-medium" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  )
}

function sheetFrame(fields: Record<string, string>): CSSProperties {
  const style: CSSProperties = {}
  const px = (key: string) => {
    const raw = fields[key]?.trim()
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  }
  const width = px('style.width')
  const height = px('style.height')
  const minWidth = px('style.minWidth')
  const maxWidth = px('style.maxWidth')
  const minHeight = px('style.minHeight')
  const maxHeight = px('style.maxHeight')
  if (width !== null) style.width = width
  if (height !== null) style.height = height
  if (minWidth !== null) style.minWidth = minWidth
  if (maxWidth !== null) style.maxWidth = maxWidth
  if (minHeight !== null) style.minHeight = minHeight
  if (maxHeight !== null) style.maxHeight = maxHeight
  if (width !== null) style.marginInline = 'auto'
  return style
}

function LayoutNodeView({
  node,
  sizing = 'fill',
}: {
  node: ScreenLayoutNode
  sizing?: PreviewSizing
}) {
  const {
    activeDrag,
    startComponentDrag,
    startNativeComponentDrag,
    handleNativeDragEnd,
    handleNativeDragOver,
    handleNativeDrop,
  } = useScreenLayout()

  const { mode } = usePreviewDisplay()
  const assist = mode === 'debug'

  return renderPreview(node.componentId, {
    sizing,
    values: node.props,
    nodes: node.children,
    dropTargetId: node.id,
    isDropTarget: activeDrag?.dropTargetId === node.id && activeDrag.overCanvas,
    className: assist ? 'cursor-grab active:cursor-grabbing' : undefined,
    interactive: true,
    draggable: assist,
    renderNode: (child, childSizing) => (
      <LayoutNodeView node={child} sizing={childSizing} />
    ),
    onPointerDown: (event) => startComponentDrag(node, event),
    onDragStart: (event) => {
      event.dataTransfer.effectAllowed = 'move'
      startNativeComponentDrag(node, event.nativeEvent)
    },
    onDragEnd: handleNativeDragEnd,
    onDragOver: (event) => {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = activeDrag?.nodeId ? 'move' : 'copy'
      handleNativeDragOver(event.clientX, event.clientY)
    },
    onDrop: (event) => {
      event.preventDefault()
      event.stopPropagation()
      handleNativeDrop(event.clientX, event.clientY)
    },
  })
}
