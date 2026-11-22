import {
  useContext,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { CircleXIcon, GitBranchIcon } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { styleSpacing } from '@/components/screens/preview/plugin-chrome'
import { rootItemClass } from '@/components/screens/preview/plugin-layout'
import { ScreenFrame } from '@/components/screens/preview/screen-frame'
import { readScreenChrome } from '@/scn/screen-theme'
import { ScnPresetSelect } from '@/scn/theme'
import { ScnToast } from '@/scn/widgets'
import { WebViewPage } from '@/components/screens/preview/web-view-page'
import { Input } from '@/components/ui/input'
import {
  PhoneSelectionView,
  PREVIEW_PHONE_HEIGHT_CLASS,
  type PhoneSelection,
} from '@/components/phones/phone-device'
import { PreviewFidelityNotice } from '@/components/preview-fidelity-notice'
import { FlowCanvas } from '@/components/screens/flow/flow-canvas'
import {
  anchorTabBar,
  convertRootContainer,
  printRainbowDocument,
  readRainbowDocument,
  rootHasContent,
  setWebViewURL,
  type RainbowDocument,
  type RootContainer,
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
import type { PreviewSizing } from '@/components/screens/preview/types'
import {
  useScreenLayout,
  type PreviewSheet,
  type PreviewToast,
  type ScreenLayoutNode,
} from '@/components/screens/screen-layout-context'

/** Toast chosen in the header, drawn over every device preview. */
const PreviewToastContext = createContext<PreviewToast | null>(null)

export function ScreenEditor({ screenId }: { screenId: string }) {
  const {
    rainbowSource,
    setRainbowSource,
    flowFocus,
    closeFlow,
    openFlow,
    sheets,
    toasts,
    rootKind,
    webView,
  } = useScreenLayout()
  const container = useNShift()
  const editorRowRef = useRef<HTMLDivElement>(null)
  const [editorOpen, setEditorOpen] = useState(true)
  const [editorWidth, setEditorWidth] = useState(448)
  const [evenSplit, setEvenSplit] = useState(true)
  const [screen, setScreen] = useState<ScreenRecord | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [mergeNote, setMergeNote] = useState<string | null>(null)
  const [versions, setVersions] = useState<ScreenVersion[]>([])
  const [viewedVersion, setViewedVersion] = useState<string | null>(null)
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const selectedSheet = sheets.find((item) => item.id === selectedSheetId) ?? null
  const [selectedToastId, setSelectedToastId] = useState<string | null>(null)
  const selectedToast = toasts.find((item) => item.id === selectedToastId) ?? null
  const [pendingContainer, setPendingContainer] = useState<RootContainer | null>(null)

  async function rewriteSource(change: (document: RainbowDocument) => boolean) {
    const document = readRainbowDocument(await container.parser.parse(rainbowSource))
    if (!document || !change(document)) return
    const printed = printRainbowDocument(document)
    const formatted = await container.parser.format(printed)
    setRainbowSource(formatted.ok && formatted.formatted ? formatted.formatted : printed)
  }

  async function chooseContainer(target: RootContainer) {
    if (target === rootKind) return
    const document = readRainbowDocument(await container.parser.parse(rainbowSource))
    if (target === 'WebView' && document && rootHasContent(document)) {
      setPendingContainer(target)
      return
    }
    await rewriteSource((current) => convertRootContainer(current, target))
  }

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
        setSelectedSheetId(null)
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

  const publish = useCallback(async () => {
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
    const source = await anchoredTabBarSource(container.parser, rainbowSource)
    if (source !== rainbowSource) setRainbowSource(source)
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
    container.parser,
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
            <div className="flex items-center gap-3 text-xs">
              {versions.length > 0 && viewedVersion ? (
                <label className="flex items-center gap-2">
                  <span className="text-muted-foreground">Versão</span>
                  <Select value={viewedVersion} onValueChange={showVersion}>
                    <SelectTrigger aria-label="Versão da tela" className="w-40" size="sm">
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
                </label>
              ) : null}
              {visibleScreen?.isRoot ? <Badge variant="outline">Root</Badge> : null}
              <span aria-hidden className="bg-border h-6 w-px" />
              <BottomSheetSelect
                sheets={sheets}
                value={selectedSheet?.id ?? 'none'}
                onChange={setSelectedSheetId}
              />
              <ToastSelect
                toasts={toasts}
                value={selectedToast?.id ?? 'none'}
                onChange={setSelectedToastId}
              />
              <span aria-hidden className="bg-border h-6 w-px" />
              <ContainerSelect
                value={rootKind}
                disabled={frozen || !rootKind}
                onChange={(target) => void chooseContainer(target)}
              />
              {webView ? (
                <WebViewURLField
                  url={webView.url}
                  disabled={frozen}
                  onCommit={(url) => void rewriteSource((current) => setWebViewURL(current, url))}
                />
              ) : null}
              <Button
                aria-pressed={Boolean(flowFocus)}
                data-tree-inspector=""
                size="sm"
                type="button"
                variant={flowFocus ? 'secondary' : 'ghost'}
                onClick={() => (flowFocus ? closeFlow() : openFlow('screen'))}
              >
                <GitBranchIcon />
                Árvore
              </Button>
              <span aria-hidden className="bg-border h-6 w-px" />
              <ScnPresetSelect label="Tema" />
              <span aria-hidden className="bg-border h-6 w-px" />
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">Editor</span>
                <Switch
                  aria-label="Mostrar editor Rainbow"
                  checked={editorOpen}
                  onCheckedChange={setEditorOpen}
                />
              </label>
              <span aria-hidden className="bg-border h-6 w-px" />
              <Button
                disabled={publishing || (!frozen && (!unpublished || hasMergeMarkers(rainbowSource)))}
                size="sm"
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
              <PreviewToastContext.Provider value={selectedToast}>
                <PhonePreview sheet={selectedSheet} />
              </PreviewToastContext.Provider>
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
      <AlertDialog
        open={pendingContainer !== null}
        onOpenChange={(open) => {
          if (!open) setPendingContainer(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transformar em WebView?</AlertDialogTitle>
            <AlertDialogDescription>
              Uma WebView mostra só uma página com a barra de navegação. Os plugins, slots e o
              scroll desta tela saem do Rainbow; a barra de navegação é mantida. Nada é publicado
              até você publicar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingContainer
                setPendingContainer(null)
                if (target) void rewriteSource((current) => convertRootContainer(current, target))
              }}
            >
              Transformar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

const PHONE_HEIGHT_CLASS = PREVIEW_PHONE_HEIGHT_CLASS
const IPHONE_ASPECT = 433 / 882
const ANDROID_ASPECT = 380 / 830
const PHONE_GAP = 32
const WHEEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const WHEEL_MOTION = `transform 1100ms ${WHEEL_EASE}, filter 1100ms ${WHEEL_EASE}`

function PhonePreview({ sheet }: { sheet: PreviewSheet | null }) {
  return (
    <PhoneSelectionView>
      {(selection) => <PhoneStage selection={selection} sheet={sheet} />}
    </PhoneSelectionView>
  )
}

function PhoneStage({
  selection,
  sheet,
}: {
  selection: PhoneSelection
  sheet: PreviewSheet | null
}) {
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
            <DevicePreview key={device} device={device} sheet={sheet} />
          ))}
        </div>
      ) : (
        <PhoneWheel devices={devices} sheet={sheet} />
      )}
    </div>
  )
}

function PhoneWheel({
  devices,
  sheet,
}: {
  devices: Array<'iphone' | 'android'>
  sheet: PreviewSheet | null
}) {
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
              <DevicePreview device={device} sheet={sheet} />
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

function DevicePreview({
  device,
  sheet,
}: {
  device: 'iphone' | 'android'
  sheet: PreviewSheet | null
}) {
  const { layoutNodes, previewError, rainbowSource, scroll, tabBar, searchBar, floatingButton } = useScreenLayout()
  const toast = useContext(PreviewToastContext)
  const { webView } = useScreenLayout()
  const Frame = device === 'iphone' ? Iphone : Android
  if (webView) {
    return (
      <Frame data-device-preview className={`${PHONE_HEIGHT_CLASS} w-auto shrink-0`}>
        <ScreenFrame chrome={readScreenChrome(rainbowSource)} device={device}>
          <div className="relative flex min-h-0 w-full flex-1 flex-col" data-preview-web-view="">
            <WebViewPage url={webView.url} />
          </div>
        </ScreenFrame>
      </Frame>
    )
  }

  return (
    <Frame
      data-device-preview
      className={`${PHONE_HEIGHT_CLASS} w-auto shrink-0`}
    >
      <ScreenFrame
        chrome={readScreenChrome(rainbowSource)}
        device={device}
        tabBar={tabBar}
        searchBar={searchBar ? <LayoutNodeView node={searchBar} /> : null}
        searchBarInset={searchBar && searchBar.children.length > 0 ? 100 : 60}
        floatingButton={floatingButton ? <LayoutNodeView node={floatingButton} /> : null}
        overlay={
          toast ? (
            <div data-preview-toast={toast.id} className="shadow-[0_8px_24px_rgba(0,0,0,0.28)] rounded-[var(--scn-radius-lg)]">
              <ScnToast
                title={toast.title}
                body={toast.message}
                icon={toast.icon || undefined}
                variant={toast.variant}
              />
            </div>
          ) : null
        }
      >
        <div
          className="phone-scroll pointer-events-none relative flex min-h-0 w-full flex-1 flex-col select-none"
          data-preview-static=""
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
              {layoutNodes.length === 0 &&
                scroll.header.length === 0 &&
                scroll.footer.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-xs text-neutral-500">
                  A tela ainda não tem plugins.
                </div>
              )}
              {scroll.header.map((node) => (
                <div key={node.id} className={rootItemClass(node.componentId, node.props)}>
                  <LayoutNodeView node={node} />
                </div>
              ))}
              <div className="pointer-events-none flex min-h-full w-full shrink-0 flex-col items-center justify-start">
                {layoutNodes.map((node) => (
                  <div key={node.id} className={rootItemClass(node.componentId, node.props)}>
                    <LayoutNodeView node={node} />
                  </div>
                ))}
              </div>
              {scroll.footer.map((node) => (
                <div key={node.id} className={rootItemClass(node.componentId, node.props)}>
                  <LayoutNodeView node={node} />
                </div>
              ))}
              {sheet ? <BottomSheetPreview sheet={sheet} /> : null}
            </>
          )}
        </div>
      </ScreenFrame>
    </Frame>
  )
}

function BottomSheetPreview({ sheet }: { sheet: PreviewSheet }) {
  const spacing = styleSpacing(sheet.fields)
  const frame = sheetFrame(sheet.fields)
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-end bg-black/40">
      <div
        className="flex max-h-[78%] min-h-[42%] w-full flex-col rounded-t-[10px] bg-[var(--scn-background)] text-[var(--scn-foreground)] shadow-[0_-12px_40px_rgba(0,0,0,0.28)]"
        style={frame}
        data-preview-sheet={sheet.id}
      >
        <div className="flex justify-center pt-2">
          <span className="h-1 w-9 rounded-full bg-[var(--scn-muted-foreground)] opacity-60" />
        </div>
        <p className="px-4 pt-3 text-center text-[17px] leading-[22px] font-semibold">
          {sheet.title}
        </p>
        <div
          className="flex min-h-0 flex-1 flex-col items-start overflow-hidden px-4 pt-3 pb-6"
          style={{ gap: spacing ?? 12 }}
        >
          {sheet.nodes.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--scn-muted-foreground)]">
              Esta bottom sheet não tem conteúdo.
            </p>
          ) : (
            sheet.nodes.map((node) => (
              <div key={node.id} className={rootItemClass(node.componentId, node.props)}>
                <LayoutNodeView node={node} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function sheetFrame(fields: PreviewSheet['fields']): CSSProperties {
  const style: CSSProperties = {}
  const px = (key: string) => {
    const raw = fields[key]
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    if (typeof raw !== 'string' || !raw.trim()) return null
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
  return renderPreview(node.componentId, {
    sizing,
    values: node.props,
    nodes: node.children,
    interactive: false,
    className: 'pointer-events-none',
    renderNode: (child, childSizing) => (
      <LayoutNodeView node={child} sizing={childSizing} />
    ),
  })
}

function BottomSheetSelect({
  sheets,
  value,
  onChange,
}: {
  sheets: PreviewSheet[]
  value: string
  onChange: (id: string | null) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted-foreground">Sheet</span>
      <Select
        value={value}
        onValueChange={(next) => onChange(next === 'none' ? null : next)}
      >
        <SelectTrigger aria-label="Bottom sheet no preview" className="w-40" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma</SelectItem>
          {sheets.map((sheet) => (
            <SelectItem key={sheet.id} value={sheet.id}>
              {sheetLabel(sheet, sheets)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function ContainerSelect({
  value,
  disabled,
  onChange,
}: {
  value: RootContainer | null
  disabled: boolean
  onChange: (target: RootContainer) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted-foreground">Container</span>
      <Select
        value={value ?? undefined}
        onValueChange={(next) => onChange(next as RootContainer)}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Plugin container da tela" className="w-32" size="sm">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Screen">Screen</SelectItem>
          <SelectItem value="WebView">WebView</SelectItem>
        </SelectContent>
      </Select>
    </label>
  )
}

/** URL of a WebView root; written to the Rainbow on Enter or when the field loses focus. */
function WebViewURLField({
  url,
  disabled,
  onCommit,
}: {
  url: string
  disabled: boolean
  onCommit: (url: string) => void
}) {
  const [draft, setDraft] = useState(url)
  const [syncedURL, setSyncedURL] = useState(url)
  if (url !== syncedURL) {
    setSyncedURL(url)
    setDraft(url)
  }
  const commit = () => {
    const next = draft.trim()
    if (next && next !== url) onCommit(next)
  }
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted-foreground">URL</span>
      <Input
        aria-label="Endereço da WebView"
        className="h-8 w-72"
        disabled={disabled}
        placeholder="https://"
        value={draft}
        onBlur={commit}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
        }}
      />
    </label>
  )
}

function ToastSelect({
  toasts,
  value,
  onChange,
}: {
  toasts: PreviewToast[]
  value: string
  onChange: (id: string | null) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted-foreground">Toast</span>
      <Select
        value={value}
        onValueChange={(next) => onChange(next === 'none' ? null : next)}
      >
        <SelectTrigger aria-label="Toast no preview" className="w-44" size="sm" disabled={toasts.length === 0}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {toasts.map((toast, index) => (
            <SelectItem key={toast.id} value={toast.id}>
              {toasts.filter((item) => item.title === toast.title).length > 1
                ? `${toast.title} · ${index + 1}`
                : toast.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function sheetLabel(sheet: PreviewSheet, sheets: PreviewSheet[]) {
  const same = sheets.filter((item) => item.title === sheet.title)
  if (same.length < 2) return sheet.title
  return `${sheet.title} · ${same.findIndex((item) => item.id === sheet.id) + 1}`
}

async function anchoredTabBarSource(
  parser: { parse: (source: string) => Promise<unknown>; format: (source: string) => Promise<{ ok: boolean; formatted?: string | null }> },
  source: string,
) {
  const document = readRainbowDocument(await parser.parse(source))
  if (!document || !anchorTabBar(document)) return source
  const printed = printRainbowDocument(document)
  const formatted = await parser.format(printed)
  return formatted.ok && formatted.formatted ? formatted.formatted : printed
}
