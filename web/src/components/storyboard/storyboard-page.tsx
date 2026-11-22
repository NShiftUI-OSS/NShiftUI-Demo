import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AlertCircleIcon, LoaderCircleIcon } from 'lucide-react'

import { api, type ScreenRecord, type StoryboardData } from '@/lib/api'
import { displayScreenName } from '@/lib/display-screen-name'
import {
  PhoneSelectionView,
  PREVIEW_PHONE_HEIGHT_CLASS,
  previewPhoneHeight,
  type PhoneSelection,
} from '@/components/phones/phone-device'
import { Android } from '@/components/ui/android'
import { Iphone } from '@/components/ui/iphone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { renderPreview } from '@/components/screens/preview'
import { rootItemClass } from '@/components/screens/preview/plugin-layout'
import { layoutFromRainbow, searchBarFromParsed, tabBarFromParsed } from '@/components/screens/rainbow-source'
import type { ScreenLayoutNode } from '@/components/screens/screen-layout-context'
import { ScreenFrame } from '@/components/screens/preview/screen-frame'
import { readScreenChrome } from '@/scn/screen-theme'
import { useNShift } from '@/di/nshift-provider'
import { reportApiError } from '@/lib/report-api-error'
import { cn } from '@/lib/utils'
import { PreviewFidelityNotice } from '@/components/preview-fidelity-notice'
import { layoutStoryboard, type LayoutPoint } from '@/components/storyboard/storyboard-layout'

type StoryboardNodeData = {
  screen: ScreenRecord
  missing?: boolean
  phoneWidth: number
  phoneHeight: number
}

type StoryboardNode = Node<StoryboardNodeData, 'screen'>

const IPHONE_ASPECT = 433 / 882
const LABEL_HEIGHT = 36

type StoryboardEdgeData = {
  points: LayoutPoint[]
  labelX: number
  labelY: number
}

type StoryboardFlowEdge = Edge<StoryboardEdgeData, 'gutter'>

const nodeTypes = { screen: StoryboardScreenNode }
const edgeTypes = { gutter: StoryboardGutterEdge }

const RETRY_LOADING_MS = 800

export function StoryboardPage() {
  const [data, setData] = useState<StoryboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    let cancelled = false
    const started = Date.now()
    setLoading(true)
    setError(null)
    api
      .storyboard()
      .then((next) => {
        if (!cancelled) setData(next)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setData(null)
        setError('Não foi possível montar o Storyboard.')
        reportApiError(reason, 'Não foi possível carregar o Storyboard')
      })
      .finally(() => {
        const finish = () => {
          if (cancelled) return
          setLoading(false)
          setRetrying(false)
        }
        if (attempt === 0) {
          finish()
          return
        }
        const wait = RETRY_LOADING_MS - (Date.now() - started)
        window.setTimeout(finish, Math.max(0, wait))
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function retryStoryboard() {
    if (retrying) return
    setRetrying(true)
    setLoading(true)
    setError(null)
    setAttempt((current) => current + 1)
  }

  return (
    <main className="relative h-full min-h-0 w-full flex-1 overflow-hidden">
      {loading ? <StoryboardLoading /> : null}
      {!loading && error ? (
        <StoryboardError message={error} disabled={retrying} onRetry={retryStoryboard} />
      ) : null}
      {!loading && !error && data ? <StoryboardGraph data={data} /> : null}
      <PreviewFidelityNotice />
    </main>
  )
}

function StoryboardLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 text-center">
      <LoaderCircleIcon className="text-primary size-12 animate-spin" />
      <div>
        <p className="text-lg font-semibold">Montando o Storyboard…</p>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
          Estamos lendo todas as telas e identificando os caminhos de navegação.
        </p>
      </div>
    </div>
  )
}

function StoryboardError({
  message,
  disabled,
  onRetry,
}: {
  message: string
  disabled: boolean
  onRetry: () => void
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
      <AlertCircleIcon className="text-destructive size-10" />
      <p className="font-semibold">{message}</p>
      <Button variant="outline" disabled={disabled} onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

function StoryboardGraph({ data }: { data: StoryboardData }) {
  const [phoneHeight, setPhoneHeight] = useState(previewPhoneHeight)
  const phoneWidth = Math.round(phoneHeight * IPHONE_ASPECT)
  const { nodes, edges } = useMemo(
    () => buildGraph(data, phoneWidth, phoneHeight),
    [data, phoneHeight, phoneWidth],
  )

  useEffect(() => {
    const update = () => setPhoneHeight(previewPhoneHeight())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (nodes.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-semibold">Nenhuma tela cadastrada</p>
        <p className="text-muted-foreground text-sm">
          Crie uma screen para começar o mapa de navegação.
        </p>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <ReactFlow
        className="storyboard-flow h-full w-full"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.08, minZoom: 0.04, maxZoom: 1 }}
        minZoom={0.04}
        maxZoom={1.25}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        panOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <StoryboardFit layoutKey={`${phoneHeight}:${nodes.length}:${edges.length}`} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.6}
          color="var(--muted-foreground)"
        />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          bgColor="var(--card)"
          maskColor="color-mix(in oklch, var(--foreground) 16%, transparent)"
          maskStrokeColor="var(--foreground)"
          nodeBorderRadius={8}
          nodeStrokeWidth={0}
          nodeColor={(node) =>
            (node.data as StoryboardNodeData).screen.isRoot
              ? 'var(--destructive)'
              : 'var(--foreground)'
          }
          style={{ width: 196, height: 128 }}
        />
      </ReactFlow>
    </ReactFlowProvider>
  )
}

function StoryboardScreenNode({ data }: { data: StoryboardNodeData }) {
  return (
    <div
      className={cn('relative flex flex-col items-center', data.missing && 'opacity-70')}
      style={{ width: data.phoneWidth, height: data.phoneHeight + LABEL_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" isConnectable={false} />
      <PhoneSelectionView>
        {(selection) => (
          <StoryboardPhone
            screen={data.screen}
            selection={selection}
            missing={data.missing}
            phoneWidth={data.phoneWidth}
            phoneHeight={data.phoneHeight}
          />
        )}
      </PhoneSelectionView>
      <div className="mt-2 flex h-7 w-full items-center justify-center gap-2">
        <span className="max-w-52 truncate text-xs font-semibold" title={data.screen.name}>
          {displayScreenName(data.screen.name)}
        </span>
        {data.screen.isRoot ? (
          <Badge variant="destructive" className="px-1.5 text-[9px]">
            Root
          </Badge>
        ) : null}
      </div>
      <Handle type="source" position={Position.Right} className="opacity-0" isConnectable={false} />
    </div>
  )
}

function StoryboardPhone({
  screen,
  selection,
  phoneWidth,
  phoneHeight,
  missing = false,
}: {
  screen: ScreenRecord
  selection: PhoneSelection
  phoneWidth: number
  phoneHeight: number
  missing?: boolean
}) {
  if (!selection.iphone && !selection.android) return null
  const device = selection.iphone ? 'iphone' : 'android'

  return (
    <div className="flex items-start justify-center" style={{ width: phoneWidth, height: phoneHeight }}>
      {device === 'iphone' ? (
        <Iphone className={`${PREVIEW_PHONE_HEIGHT_CLASS} w-auto shrink-0`}>
          <ScreenPreview screen={screen} device={device} missing={missing} />
        </Iphone>
      ) : (
        <Android className={`${PREVIEW_PHONE_HEIGHT_CLASS} w-auto shrink-0`}>
          <ScreenPreview screen={screen} device={device} missing={missing} />
        </Android>
      )}
    </div>
  )
}

function ScreenPreview({
  screen,
  device,
  missing,
}: {
  screen: ScreenRecord
  device: 'iphone' | 'android'
  missing: boolean
}) {
  const container = useNShift()
  const [nodes, setNodes] = useState<ScreenLayoutNode[] | null>(null)
  const [tabBar, setTabBar] = useState<ScreenLayoutNode | null>(null)
  const [searchBar, setSearchBar] = useState<ScreenLayoutNode | null>(null)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    let cancelled = false
    setNodes(null)
    setTabBar(null)
    setInvalid(false)
    void container.parser.parse(screen.rainbow).then((parsed) => {
      if (cancelled) return
      const layout = layoutFromRainbow(parsed)
      if (!layout) {
        setInvalid(true)
        return
      }
      setNodes(layout)
      setTabBar(tabBarFromParsed(parsed))
      setSearchBar(searchBarFromParsed(parsed))
    })
    return () => {
      cancelled = true
    }
  }, [container.parser, screen.rainbow])

  const chrome = readScreenChrome(screen.rainbow)
  return (
    <ScreenFrame
      chrome={chrome}
      device={device}
      tabBar={tabBar}
      searchBar={searchBar ? <StoryboardLayoutNode node={searchBar} /> : null}
      searchBarInset={searchBar && searchBar.children.length > 0 ? 100 : 60}
      interactive={false}
    >
      <div className="phone-scroll relative flex min-h-0 w-full flex-1 flex-col">
        {missing ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 text-center text-[10px]">
            Destino ausente
          </div>
        ) : invalid ? (
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 text-center text-[10px]">
            Preview indisponível
          </div>
        ) : nodes === null ? (
          <div className="flex min-h-0 flex-1 items-center justify-center text-[10px]">
            Carregando…
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center px-5 text-center text-[10px]">
            Tela vazia
          </div>
        ) : (
          <div className="flex min-h-full w-full shrink-0 flex-col items-center justify-center">
            {nodes.map((node) => (
              <div key={node.id} className={rootItemClass(node.componentId, node.props)}>
                <StoryboardLayoutNode node={node} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenFrame>
  )
}

function StoryboardLayoutNode({
  node,
  sizing = 'fill',
}: {
  node: ScreenLayoutNode
  sizing?: 'fill' | 'intrinsic'
}) {
  return renderPreview(node.componentId, {
    sizing,
    values: node.props,
    nodes: node.children,
    interactive: false,
    className: 'pointer-events-none',
    renderNode: (child, childSizing) => (
      <StoryboardLayoutNode node={child as ScreenLayoutNode} sizing={childSizing} />
    ),
  })
}

function buildGraph(data: StoryboardData, phoneWidth: number, phoneHeight: number) {
  const screenById = new Map(data.screens.map((screen) => [screen.id, screen]))
  const missingScreens = new Map<string, ScreenRecord>()
  for (const edge of data.edges) {
    if (!screenById.has(edge.target)) {
      missingScreens.set(edge.target, {
        id: edge.target,
        name: edge.targetName,
        description: 'Essa tela ainda não existe no CMS.',
        rainbow: '',
        revision: 0,
        version: '0.0.0',
        isRoot: false,
        createdAt: '',
        updatedAt: '',
      })
    }
  }

  const allScreens = [...data.screens, ...missingScreens.values()]
  const layout = layoutStoryboard(
    allScreens.map((screen) => ({
      id: screen.id,
      name: screen.name,
      isRoot: screen.isRoot,
    })),
    data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
    phoneWidth,
    phoneHeight,
    LABEL_HEIGHT,
  )
  const placed = new Map(layout.placements.map((node) => [node.id, node]))
  const nodeWidth = phoneWidth
  const nodeHeight = phoneHeight + LABEL_HEIGHT
  const nodes: StoryboardNode[] = allScreens.map((screen) => {
    const position = placed.get(screen.id)
    return {
      id: screen.id,
      type: 'screen',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      width: nodeWidth,
      height: nodeHeight,
      position: { x: position?.x ?? 0, y: position?.y ?? 0 },
      data: {
        screen,
        missing: screen.id.startsWith('missing:'),
        phoneWidth,
        phoneHeight,
      },
      style: { width: nodeWidth, height: nodeHeight },
    }
  })
  const routed = new Map(layout.routes.map((edge) => [edge.id, edge]))
  const edges: StoryboardFlowEdge[] = []
  for (const edge of data.edges) {
    const route = routed.get(edge.id)
    if (!route || route.points.length < 2) continue
    const color = edge.async ? 'var(--primary)' : 'var(--foreground)'
    edges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.async ? 'AsyncNavigate' : 'Navigate',
      type: 'gutter',
      animated: edge.async,
      data: { points: route.points, labelX: route.labelX, labelY: route.labelY },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color,
        markerUnits: 'userSpaceOnUse',
      },
      labelStyle: {
        fill: 'var(--foreground)',
        fontSize: 12,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: 'var(--background)',
        fillOpacity: 0.94,
      },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 6,
      style: {
        stroke: color,
        strokeDasharray: '7 6',
        strokeWidth: 2.5,
        strokeLinecap: 'butt',
        vectorEffect: 'non-scaling-stroke',
      },
    })
  }
  return { nodes, edges }
}

function StoryboardFit({ layoutKey }: { layoutKey: string }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.08, duration: 0, minZoom: 0.04, maxZoom: 1 })
    })
    return () => cancelAnimationFrame(frame)
  }, [fitView, layoutKey])
  return null
}

function StoryboardGutterEdge({
  id,
  data,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  markerEnd,
  style,
}: EdgeProps<StoryboardFlowEdge>) {
  const points = data?.points ?? []
  if (points.length < 2) return null
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ')
  return (
    <BaseEdge
      id={id}
      path={path}
      labelX={data?.labelX}
      labelY={data?.labelY}
      label={label}
      labelStyle={labelStyle}
      labelShowBg={labelShowBg}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
      markerEnd={markerEnd}
      interactionWidth={0}
      style={style}
    />
  )
}
