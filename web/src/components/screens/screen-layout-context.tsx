/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

import {
  screenComponents,
  type ScreenComponentDefinition,
} from '@/components/screens/preview'
import {
  layoutFromRainbow,
  sheetNodesFromDocument,
} from '@/components/screens/rainbow-source'
import {
  defaultRainbowSource,
  insertPlugin,
  moveNode,
  printRainbowDocument,
  ensureBottomSheet,
  findSheet,
  readPlacedPlugin,
  readRainbowDocument,
  removeBottomSheet as deleteBottomSheet,
  removePlacedPlugin,
  updatePlacedPlugin,
  type RainbowDocument,
} from '@/components/screens/rainbow-document'
import { useNShift } from '@/di/nshift-provider'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { PluginMetadataValue } from '@/scn/plugin-fields'
import type { NShiftPluginStyle } from '@/domain/plugins/style/nshift-plugin-style'

export type ScreenLayoutNode = {
  id: string
  componentId: string
  plugin?: NShiftPluginModel | null
  props?: Record<string, string | number | boolean | string[]>
  children: ScreenLayoutNode[]
}

export type PendingPlacement = {
  componentId: string
  dropTargetId: string | null
  dropIndex: number
}

export type DropGuide = {
  x: number
  y: number
  length: number
  axis: 'x' | 'y'
  distances: DistanceMark[]
}

export type DistanceMark = {
  x: number
  y: number
  length: number
  axis: 'x' | 'y'
  label: string
}

type ActiveLayoutDrag = {
  componentId: string
  nodeId?: string
  pointerId: number
  pointerX: number
  pointerY: number
  startX: number
  startY: number
  started: boolean
  overCanvas: boolean
  dropTargetId: string | null
  dropIndex: number
  dropGuide: DropGuide | null
}

type ScreenLayoutContextValue = {
  layoutNodes: ScreenLayoutNode[]
  rainbowSource: string
  previewError: boolean
  pendingPlacement: PendingPlacement | null
  activeDrag: ActiveLayoutDrag | null
  setRainbowSource: (source: string) => void
  bindRainbowScreen: (screenId: string, source?: string) => void
  commitPlacement: (plugin: NShiftPluginModel) => void
  cancelPlacement: () => void
  replaceLayout: (nodes: ScreenLayoutNode[] | null) => void
  registerCanvas: (node: HTMLDivElement | null) => void
  startLibraryDrag: (
    component: ScreenComponentDefinition,
    event: ReactPointerEvent,
  ) => void
  startNativeLibraryDrag: (component: ScreenComponentDefinition) => void
  startComponentDrag: (node: ScreenLayoutNode, event: ReactPointerEvent) => void
  startNativeComponentDrag: (node: ScreenLayoutNode, event: DragEvent) => void
  handleNativeDragOver: (clientX: number, clientY: number) => void
  handleNativeDrop: (clientX: number, clientY: number) => void
  handleNativeDragEnd: () => void
  flowFocus: string | null
  openFlow: (nodeId: string) => void
  closeFlow: () => void
  pluginAction: { nodeId: string; componentId: string } | null
  openPluginAction: (action: { nodeId: string; componentId: string }) => void
  closePluginAction: () => void
  savePlacedPlugin: (
    nodeId: string,
    input: {
      name: string
      version: string
      metadata: Record<string, PluginMetadataValue>
      fieldNames: string[]
      style?: NShiftPluginStyle
    },
  ) => void
  removePlaced: (nodeId: string) => void
  sheet: {
    title: string
    fields: Record<string, string>
    nodes: ScreenLayoutNode[]
  } | null
  sheetEditor: boolean
  openSheetEditor: () => void
  closeSheetEditor: () => void
  addBottomSheet: () => void
  removeBottomSheet: () => void
  requestSheetEdit: () => void
  sheetEditToken: number
}

const ScreenLayoutContext = createContext<ScreenLayoutContextValue | null>(null)

const DRAG_THRESHOLD = 5

function isDirectChild(id: string, parentId: string | null) {
  if (parentId === 'sheet') {
    const rest = id.slice('sheet/'.length)
    return id.startsWith('sheet/') && rest.length > 0 && !rest.includes('/')
  }
  if (parentId === null) return !id.includes('/')
  const rest = id.slice(parentId.length + 1)
  return id.startsWith(`${parentId}/`) && rest.length > 0 && !rest.includes('/')
}

function insertionPlace(
  container: HTMLElement,
  siblings: HTMLElement[],
  clientX: number,
  clientY: number,
) {
  const bounds = container.getBoundingClientRect()
  const layout = container.dataset.layout
  const horizontal = layout === 'horizontal' || layout === 'horizontal-scroll'

  if (siblings.length === 0) {
    const guide = horizontal
      ? {
          x: bounds.left + bounds.width / 2,
          y: bounds.top + 12,
          length: Math.max(24, bounds.height - 24),
          axis: 'y' as const,
        }
      : {
          x: bounds.left + 8,
          y: bounds.top + bounds.height / 2,
          length: Math.max(24, bounds.width - 16),
          axis: 'x' as const,
        }
    return { index: 0, guide: { ...guide, distances: [] } }
  }

  for (let index = 0; index < siblings.length; index += 1) {
    const rect = siblings[index].getBoundingClientRect()
    const before = horizontal
      ? clientX < rect.left + rect.width / 2
      : clientY < rect.top + rect.height / 2
    if (!before) continue
    const previous =
      index > 0 ? siblings[index - 1].getBoundingClientRect() : null
    const guide = horizontal
      ? {
          x: previous ? (previous.right + rect.left) / 2 : rect.left,
          y: rect.top,
          length: Math.max(rect.height, 24),
          axis: 'y' as const,
        }
      : {
          x: rect.left,
          y: previous ? (previous.bottom + rect.top) / 2 : rect.top,
          length: Math.max(rect.width, 24),
          axis: 'x' as const,
        }
    return { index, guide: { ...guide, distances: [] } }
  }

  const last = siblings[siblings.length - 1].getBoundingClientRect()
  const guide = horizontal
    ? {
        x: last.right,
        y: last.top,
        length: Math.max(last.height, 24),
        axis: 'y' as const,
      }
    : {
        x: last.left,
        y: last.bottom,
        length: Math.max(last.width, 24),
        axis: 'x' as const,
      }
  return {
    index: siblings.length,
    guide: { ...guide, distances: [] },
  }
}

export function ScreenLayoutProvider({ children }: { children: ReactNode }) {
  const container = useNShift()
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<ActiveLayoutDrag | null>(null)
  const sourceRef = useRef('')
  const revisionRef = useRef(0)
  const boundScreenRef = useRef<string | null>(null)
  const [layoutNodes, setLayoutNodes] = useState<ScreenLayoutNode[]>([])
  const [rainbowSource, setRainbowSourceState] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [pendingPlacement, setPendingPlacement] =
    useState<PendingPlacement | null>(null)
  const pendingRef = useRef<PendingPlacement | null>(null)
  const [activeDrag, setActiveDrag] = useState<ActiveLayoutDrag | null>(null)
  const [flowFocus, setFlowFocus] = useState<string | null>(null)
  const [pluginAction, setPluginAction] = useState<{
    nodeId: string
    componentId: string
  } | null>(null)
  const [sheet, setSheet] = useState<{
    title: string
    fields: Record<string, string>
    nodes: ScreenLayoutNode[]
  } | null>(null)
  const [sheetEditor, setSheetEditor] = useState(false)
  const [sheetEditToken, setSheetEditToken] = useState(0)

  const syncSheet = useCallback((document: RainbowDocument) => {
    const placed = readPlacedPlugin(document, 'sheet')
    if (!placed || !findSheet(document)) {
      setSheet(null)
      setSheetEditor(false)
      return
    }
    setSheet({
      title: placed.fields.title || 'Bottom sheet',
      fields: placed.fields,
      nodes: sheetNodesFromDocument(document),
    })
  }, [])

  const registerCanvas = useCallback((node: HTMLDivElement | null) => {
    canvasRef.current = node
  }, [])

  const setRainbowSource = useCallback((source: string) => {
    revisionRef.current += 1
    sourceRef.current = source
    setRainbowSourceState(source)
  }, [])

  const bindRainbowScreen = useCallback(
    (screenId: string, source?: string) => {
      if (boundScreenRef.current === screenId) return
      boundScreenRef.current = screenId
      setFlowFocus(null)
      setRainbowSource(source ?? defaultRainbowSource(screenId))
    },
    [setRainbowSource],
  )

  const publishDocument = useCallback(
    async (document: RainbowDocument) => {
      const printed = printRainbowDocument(document)
      const revision = revisionRef.current + 1
      revisionRef.current = revision
      sourceRef.current = printed
      setRainbowSourceState(printed)
      const layout = layoutFromRainbow({ ok: true, document })
      if (!layout) {
        setPreviewError(true)
        setLayoutNodes([])
      } else {
        setPreviewError(false)
        setLayoutNodes(layout)
      }
      syncSheet(document)
      const formatted = await container.parser.format(printed)
      if (revisionRef.current !== revision) return
      if (
        formatted.ok &&
        formatted.formatted &&
        formatted.formatted !== printed
      ) {
        revisionRef.current += 1
        sourceRef.current = formatted.formatted
        setRainbowSourceState(formatted.formatted)
      }
    },
    [container, syncSheet],
  )

  const editDocument = useCallback(
    async (mutate: (document: RainbowDocument) => boolean) => {
      const parsed = await container.parser.parse(sourceRef.current)
      const document = readRainbowDocument(parsed)
      if (!document) return
      if (!mutate(document)) return
      await publishDocument(document)
    },
    [container, publishDocument],
  )

  const resolveDropTarget = useCallback(
    (clientX: number, clientY: number, draggingId?: string) => {
      const element = document.elementFromPoint(clientX, clientY)
      if (element?.closest('[data-sheet-overlay]')) {
        const sheetTarget = element.closest<HTMLElement>('[data-drop-target]')
        const sheetId = sheetTarget?.dataset.dropTargetId ?? ''
        if (sheetId !== 'sheet' && !sheetId.startsWith('sheet/')) {
          return {
            overCanvas: false,
            dropTargetId: null as string | null,
            dropIndex: 0,
            dropGuide: null as DropGuide | null,
          }
        }
      }
      const target = element?.closest<HTMLElement>('[data-drop-target]')
      const phone = target?.closest('[data-phone]')

      if (!target || !phone) {
        return {
          overCanvas: false,
          dropTargetId: null as string | null,
          dropIndex: 0,
          dropGuide: null as DropGuide | null,
        }
      }

      const rawTargetId = target.dataset.dropTargetId
      const dropTargetId = rawTargetId === 'root' ? null : (rawTargetId ?? null)
      const siblings = [
        ...target.querySelectorAll<HTMLElement>('[data-layout-node]'),
      ].filter((node) => {
        const id = node.dataset.layoutNode
        if (!id || id === draggingId) return false
        return isDirectChild(id, dropTargetId)
      })
      const place = insertionPlace(target, siblings, clientX, clientY)

      return {
        overCanvas: true,
        dropTargetId,
        dropIndex: place.index,
        dropGuide: place.guide,
      }
    },
    [],
  )

  const updateDrag = useCallback(
    (clientX: number, clientY: number, forceStarted = false) => {
      const current = dragRef.current
      if (!current) return

      const movedDistance = Math.hypot(
        clientX - current.startX,
        clientY - current.startY,
      )
      const started =
        forceStarted || current.started || movedDistance >= DRAG_THRESHOLD
      const target = resolveDropTarget(clientX, clientY, current.nodeId)
      const next = {
        ...current,
        pointerX: clientX,
        pointerY: clientY,
        started,
        ...target,
      }

      dragRef.current = next
      setActiveDrag(next)
    },
    [resolveDropTarget],
  )

  const finishDrag = useCallback(() => {
    const current = dragRef.current
    if (!current) return

    if (!current.started) {
      if (current.nodeId) {
        setPluginAction({
          nodeId: current.nodeId,
          componentId: current.componentId,
        })
      }
      dragRef.current = null
      setActiveDrag(null)
      return
    }

    if (current.started && current.overCanvas && !current.nodeId) {
      const pending = {
        componentId: current.componentId,
        dropTargetId: current.dropTargetId,
        dropIndex: current.dropIndex,
      }
      pendingRef.current = pending
      setPendingPlacement(pending)
      dragRef.current = null
      setActiveDrag(null)
      return
    }

    if (current.started && current.overCanvas && current.nodeId) {
      const nodeId = current.nodeId
      const targetId = current.dropTargetId
      const index = current.dropIndex
      void editDocument((document) =>
        moveNode(document, nodeId, targetId, index),
      )
    }

    dragRef.current = null
    setActiveDrag(null)
  }, [editDocument])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return
      event.preventDefault()
      updateDrag(event.clientX, event.clientY)
    }
    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return
      finishDrag()
    }
    const handlePointerCancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return
      dragRef.current = null
      setActiveDrag(null)
    }
    const handleNativeDragOver = (event: DragEvent) => {
      if (dragRef.current?.pointerId !== -1) return
      event.preventDefault()
      updateDrag(event.clientX, event.clientY, true)
    }

    window.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    window.addEventListener('dragover', handleNativeDragOver)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('dragover', handleNativeDragOver)
    }
  }, [finishDrag, updateDrag])

  const startLibraryDrag = useCallback(
    (component: ScreenComponentDefinition, event: ReactPointerEvent) => {
      if (event.button !== 0) return
      event.preventDefault()
      const next: ActiveLayoutDrag = {
        componentId: component.id,
        pointerId: event.pointerId,
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        started: false,
        overCanvas: false,
        dropTargetId: null,
        dropIndex: 0,
        dropGuide: null,
      }
      dragRef.current = next
      setActiveDrag(next)
    },
    [],
  )

  const startNativeLibraryDrag = useCallback(
    (component: ScreenComponentDefinition) => {
      const next: ActiveLayoutDrag = {
        componentId: component.id,
        pointerId: -1,
        pointerX: 0,
        pointerY: 0,
        startX: 0,
        startY: 0,
        started: true,
        overCanvas: false,
        dropTargetId: null,
        dropIndex: 0,
        dropGuide: null,
      }
      dragRef.current = next
      setActiveDrag(next)
    },
    [],
  )

  const startComponentDrag = useCallback(
    (node: ScreenLayoutNode, event: ReactPointerEvent) => {
      if (event.button !== 0) return
      event.preventDefault()
      const next: ActiveLayoutDrag = {
        componentId: node.componentId,
        nodeId: node.id,
        pointerId: event.pointerId,
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        started: false,
        overCanvas: true,
        dropTargetId: null,
        dropIndex: 0,
        dropGuide: null,
      }
      dragRef.current = next
      setActiveDrag(next)
    },
    [],
  )

  const startNativeComponentDrag = useCallback(
    (node: ScreenLayoutNode, event: DragEvent) => {
      const next: ActiveLayoutDrag = {
        componentId: node.componentId,
        nodeId: node.id,
        pointerId: -1,
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        started: true,
        overCanvas: true,
        dropTargetId: null,
        dropIndex: 0,
        dropGuide: null,
      }
      dragRef.current = next
      setActiveDrag(next)
    },
    [],
  )

  const handleNativeDragOver = useCallback(
    (clientX: number, clientY: number) => {
      if (dragRef.current?.pointerId !== -1) return
      updateDrag(clientX, clientY, true)
    },
    [updateDrag],
  )

  const handleNativeDrop = useCallback(
    (clientX: number, clientY: number) => {
      if (dragRef.current?.pointerId !== -1) return
      updateDrag(clientX, clientY, true)
      finishDrag()
    },
    [finishDrag, updateDrag],
  )

  const commitPlacement = useCallback(
    (plugin: NShiftPluginModel) => {
      const pending = pendingRef.current
      if (!pending) return
      pendingRef.current = null
      setPendingPlacement(null)
      const acceptsChildren =
        screenComponents.find((item) => item.id === pending.componentId)
          ?.acceptsChildren === true
      void editDocument((document) =>
        insertPlugin(
          document,
          pending.dropTargetId,
          plugin,
          acceptsChildren,
          pending.dropIndex,
        ),
      )
    },
    [editDocument],
  )

  const removePlaced = useCallback(
    (nodeId: string) => {
      void editDocument((document) => removePlacedPlugin(document, nodeId))
    },
    [editDocument],
  )

  const savePlacedPlugin = useCallback(
    (
      nodeId: string,
      input: {
        name: string
        version: string
        metadata: Record<string, PluginMetadataValue>
        fieldNames: string[]
        style?: NShiftPluginStyle
      },
    ) => {
      void editDocument((document) =>
        updatePlacedPlugin(document, nodeId, input),
      )
    },
    [editDocument],
  )

  const cancelPlacement = useCallback(() => {
    pendingRef.current = null
    setPendingPlacement(null)
  }, [])

  const replaceLayout = useCallback((nodes: ScreenLayoutNode[] | null) => {
    if (!nodes) {
      setPreviewError(true)
      setLayoutNodes([])
      return
    }
    setPreviewError(false)
    setLayoutNodes(nodes)
  }, [])

  useEffect(() => {
    if (!rainbowSource) return
    let cancelled = false
    const timeout = window.setTimeout(() => {
      void container.parser.parse(rainbowSource).then((parsed) => {
        if (cancelled) return
        replaceLayout(layoutFromRainbow(parsed))
        const document = readRainbowDocument(parsed)
        if (document) syncSheet(document)
      })
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [container, rainbowSource, replaceLayout, syncSheet])

  const handleNativeDragEnd = useCallback(() => {
    if (dragRef.current?.pointerId !== -1) return
    dragRef.current = null
    setActiveDrag(null)
  }, [])

  return (
    <ScreenLayoutContext.Provider
      value={{
        layoutNodes,
        rainbowSource,
        previewError,
        pendingPlacement,
        activeDrag,
        setRainbowSource,
        bindRainbowScreen,
        commitPlacement,
        cancelPlacement,
        replaceLayout,
        registerCanvas,
        startLibraryDrag,
        startNativeLibraryDrag,
        startComponentDrag,
        startNativeComponentDrag,
        handleNativeDragOver,
        handleNativeDrop,
        handleNativeDragEnd,
        flowFocus,
        openFlow: setFlowFocus,
        closeFlow: () => setFlowFocus(null),
        pluginAction,
        openPluginAction: setPluginAction,
        closePluginAction: () => setPluginAction(null),
        savePlacedPlugin,
        removePlaced,
        sheet,
        sheetEditor,
        openSheetEditor: () => {
          if (sheet) setSheetEditor(true)
        },
        closeSheetEditor: () => setSheetEditor(false),
        addBottomSheet: () => {
          void editDocument((document) => ensureBottomSheet(document)).then(
            () => {
              setSheetEditor(true)
            },
          )
        },
        removeBottomSheet: () => {
          setSheetEditor(false)
          void editDocument((document) => deleteBottomSheet(document))
        },
        requestSheetEdit: () => setSheetEditToken((current) => current + 1),
        sheetEditToken,
      }}
    >
      {children}
    </ScreenLayoutContext.Provider>
  )
}

export function useScreenLayout() {
  const context = useContext(ScreenLayoutContext)
  if (!context) {
    throw new Error('useScreenLayout must be used inside ScreenLayoutProvider.')
  }
  return context
}
