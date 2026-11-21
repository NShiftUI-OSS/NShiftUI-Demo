import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Background,
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
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CircleXIcon } from 'lucide-react'

import { PreviewFidelityNotice } from '@/components/preview-fidelity-notice'
import { buildFlow, type FlowCard } from '@/components/screens/flow/flow-model'
import {
  readRainbowDocument,
  type RainbowDocument,
} from '@/components/screens/rainbow-document'
import { useScreenLayout } from '@/components/screens/screen-layout-context'
import { useTheme } from '@/components/layout/theme'
import { useNShift } from '@/di/nshift-provider'
import { cn } from '@/lib/utils'

type FlowNodeData = FlowCard & {
  onFocus?: (path: string) => void
}
type FlowNode = Node<FlowNodeData, FlowCard['kind']>

const TREE_INSPECTOR_IDLE_MS = 300

export function FlowCanvas({ focus }: { focus: string }) {
  const { rainbowSource, openFlow } = useScreenLayout()
  const { resolvedTheme } = useTheme()
  const tree = useDebouncedRainbowTree(rainbowSource)

  return (
    <ReactFlowProvider>
      <FlowView
        focus={focus}
        document={tree.document}
        syntaxError={tree.syntaxError}
        colorMode={resolvedTheme}
        onFocus={openFlow}
      />
    </ReactFlowProvider>
  )
}

function useDebouncedRainbowTree(source: string) {
  const container = useNShift()
  const revisionRef = useRef(0)
  const hasScheduledParse = useRef(false)
  const [document, setDocument] = useState<RainbowDocument | null>(null)
  const [syntaxError, setSyntaxError] = useState(false)

  useEffect(() => {
    const revision = ++revisionRef.current
    const delay = hasScheduledParse.current ? TREE_INSPECTOR_IDLE_MS : 0
    const timeout = window.setTimeout(() => {
      hasScheduledParse.current = true
      void container.parser
        .parse(source)
        .then((parsed) => {
          if (revision !== revisionRef.current) return
          const next = readRainbowDocument(parsed)
          if (!next) {
            setSyntaxError(true)
            return
          }
          setDocument(next)
          setSyntaxError(false)
        })
        .catch(() => {
          if (revision !== revisionRef.current) return
          setSyntaxError(true)
        })
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      revisionRef.current += 1
    }
  }, [container, source])

  return { document, syntaxError }
}

const cardWidth: Record<FlowCard['kind'], number> = {
  screen: 220,
  plugin: 220,
  trigger: 132,
  event: 210,
}

const FlowView = memo(function FlowView({
  focus,
  document,
  syntaxError,
  colorMode,
  onFocus,
}: {
  focus: string
  document: RainbowDocument | null
  syntaxError: boolean
  colorMode: 'light' | 'dark'
  onFocus: (path: string) => void
}) {
  const graph = useMemo(
    () => (document ? buildFlow(document, focus) : { cards: [], links: [] }),
    [document, focus],
  )
  const nodes = useMemo<FlowNode[]>(
    () =>
      graph.cards.map((card) => ({
        id: card.id,
        type: card.kind,
        position: { x: card.x, y: card.y },
        width: cardWidth[card.kind],
        height: 76,
        style: { width: cardWidth[card.kind], height: 76 },
        data: { ...card, onFocus },
        draggable: false,
        connectable: false,
        selectable: false,
        deletable: false,
      })),
    [graph.cards, onFocus],
  )
  const edges = useMemo<Edge[]>(
    () =>
      graph.links.map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        sourceHandle: link.sourceHandle,
        targetHandle: link.targetHandle,
        type: 'tree',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: 'var(--foreground)',
        },
      })),
    [graph.links],
  )

  return (
    <div className="event-flow bg-background relative h-full min-h-[70vh] w-full overflow-hidden rounded-xl border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode={colorMode}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesReconnectable={false}
        deleteKeyCode={null}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'tree' }}
        className="bg-muted/30"
      >
        <Background gap={22} size={1.4} />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          pannable
          zoomable
          position="top-right"
          bgColor={colorMode === 'light' ? '#f4f4f5' : '#262626'}
          maskColor={
            colorMode === 'light'
              ? 'rgba(0,0,0,0.15)'
              : 'rgba(255,255,255,0.14)'
          }
          nodeStrokeWidth={3}
          nodeColor={minimapColor}
        />
        <FitFocus focus={focus} hasNodes={nodes.length > 0} />
      </ReactFlow>
      <FlowLegend />
      <PreviewFidelityNotice />
      {syntaxError ? <SyntaxErrorOverlay /> : null}
    </div>
  )
})

function SyntaxErrorOverlay() {
  return (
    <div className="bg-background/80 absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
      <CircleXIcon
        className="size-10 fill-red-500 text-white"
        strokeWidth={1.75}
      />
      <p className="text-[15px] font-semibold text-current">Syntax Error</p>
    </div>
  )
}

function FitFocus({ focus, hasNodes }: { focus: string; hasNodes: boolean }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    if (!hasNodes) return
    const timeout = window.setTimeout(() => {
      void fitView({ padding: 0.28, duration: 280 })
    }, 40)
    return () => window.clearTimeout(timeout)
  }, [fitView, focus, hasNodes])
  return null
}

function FlowLegend() {
  return (
    <div className="bg-card/95 pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-3 rounded-lg border px-3 py-2 text-[11px] shadow-sm">
      <span className="font-semibold">Tree inspector</span>
      <LegendSwatch className="bg-card border-border" label="Tela e plugin" />
      <LegendSwatch
        className="border-rose-400 bg-rose-500/15"
        label="Trigger"
      />
      <LegendSwatch
        className="border-amber-500 bg-amber-500/15"
        label="Evento"
      />
    </div>
  )
}

function LegendSwatch({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-2.5 rounded-sm border', className)} />
      {label}
    </span>
  )
}

function minimapColor(node: Node) {
  const kind = (node.data as FlowNodeData | undefined)?.kind
  if (kind === 'trigger') return '#e11d48'
  if (kind === 'event') return '#d97706'
  if (kind === 'screen') return '#2563eb'
  return '#737373'
}

function PluginNode({ data }: NodeProps<FlowNode>) {
  return (
    <FlowCardShell
      data={data}
      tone="border-border bg-card text-left"
      onClick={() => data.onFocus?.(data.path)}
    >
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        Plugin
      </span>
      <strong className="block truncate text-sm">{data.title}</strong>
      {data.detail ? (
        <span className="text-muted-foreground block truncate text-xs">
          {data.detail}
        </span>
      ) : null}
    </FlowCardShell>
  )
}

function ScreenNode({ data }: NodeProps<FlowNode>) {
  return (
    <FlowCardShell data={data} tone="border-primary/50 bg-card text-left">
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        Tela
      </span>
      <strong className="block truncate text-sm">{data.title}</strong>
      {data.detail ? (
        <span className="text-muted-foreground block truncate text-xs">
          {data.detail}
        </span>
      ) : null}
    </FlowCardShell>
  )
}

function TriggerNode({ data }: NodeProps<FlowNode>) {
  return (
    <FlowCardShell
      data={data}
      tone="border-dashed border-rose-400 bg-rose-500/10 text-center"
    >
      <span className="text-[10px] tracking-wide text-rose-600 uppercase dark:text-rose-300">
        Trigger
      </span>
      <strong className="block text-sm">{data.title}</strong>
      {data.detail ? (
        <span className="text-muted-foreground block text-[10px]">
          {data.detail}
        </span>
      ) : null}
    </FlowCardShell>
  )
}

function EventNode({ data }: NodeProps<FlowNode>) {
  return (
    <FlowCardShell
      data={data}
      tone="border-amber-500/70 bg-amber-500/10 text-left"
      onClick={() => data.onFocus?.(data.path)}
    >
      <span className="text-[10px] tracking-wide text-amber-700 uppercase dark:text-amber-300">
        Evento
      </span>
      <strong className="block truncate text-sm">{data.title}</strong>
      {data.detail ? (
        <span className="text-muted-foreground block truncate text-xs">
          {data.detail}
        </span>
      ) : null}
    </FlowCardShell>
  )
}

function FlowCardShell({
  data,
  tone,
  children,
  onClick,
}: {
  data: FlowNodeData
  tone: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <div
      className={cardClass(data, cn('h-full w-full', tone))}
      onClick={onClick}
    >
      <FlowHandles />
      {children}
    </div>
  )
}

function FlowHandles() {
  return (
    <>
      <Handle
        id="in-top"
        type="target"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        id="out-bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={false}
      />
      <Handle
        id="in-left"
        type="target"
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        id="out-right"
        type="source"
        position={Position.Right}
        isConnectable={false}
      />
    </>
  )
}

function cardClass(data: FlowCard, tone: string) {
  return cn(
    'rounded-lg border px-3 py-2 shadow-sm',
    tone,
    data.relation === 'dim' && 'opacity-35',
    data.relation === 'focus' &&
      data.kind !== 'trigger' &&
      'ring-primary ring-2',
  )
}

function stairPath(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  if (Math.abs(sourceX - targetX) < 1) {
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
  }
  const midY = sourceY + Math.max(28, (targetY - sourceY) * 0.46)
  return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
}

const TreeEdge = memo(function TreeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  markerEnd,
}: EdgeProps) {
  const side =
    sourcePosition === Position.Left || sourcePosition === Position.Right
  const path = side
    ? Math.abs(sourceY - targetY) < 0.5
      ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
      : `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`
    : stairPath(sourceX, sourceY, targetX, targetY)
  return <BaseEdge path={path} markerEnd={markerEnd} />
})

const nodeTypes = {
  plugin: PluginNode,
  screen: ScreenNode,
  trigger: TriggerNode,
  event: EventNode,
}

const edgeTypes = {
  tree: TreeEdge,
}
