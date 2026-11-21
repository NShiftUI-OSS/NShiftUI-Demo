/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  layoutFromRainbow,
  sheetsFromDocument,
  tabBarFromDocument,
  type PreviewSheet,
} from '@/components/screens/rainbow-source'
import { defaultRainbowSource, readRainbowDocument } from '@/components/screens/rainbow-document'
import { useNShift } from '@/di/nshift-provider'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'

export type ScreenLayoutNode = {
  id: string
  componentId: string
  plugin?: NShiftPluginModel | null
  props?: Record<string, string | number | boolean | string[]>
  children: ScreenLayoutNode[]
}

export type { PreviewSheet }

type ScreenLayoutContextValue = {
  layoutNodes: ScreenLayoutNode[]
  rainbowSource: string
  previewError: boolean
  setRainbowSource: (source: string) => void
  bindRainbowScreen: (screenId: string, source?: string) => void
  flowFocus: string | null
  openFlow: (nodeId: string) => void
  closeFlow: () => void
  sheets: PreviewSheet[]
  tabBar: ScreenLayoutNode | null
}

const ScreenLayoutContext = createContext<ScreenLayoutContextValue | null>(null)

export function ScreenLayoutProvider({ children }: { children: ReactNode }) {
  const container = useNShift()
  const boundScreenRef = useRef<string | null>(null)
  const [layoutNodes, setLayoutNodes] = useState<ScreenLayoutNode[]>([])
  const [tabBarNode, setTabBarNode] = useState<ScreenLayoutNode | null>(null)
  const [sheets, setSheets] = useState<PreviewSheet[]>([])
  const [rainbowSource, setRainbowSourceState] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [flowFocus, setFlowFocus] = useState<string | null>(null)

  const setRainbowSource = useCallback((source: string) => {
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
        setTabBarNode(document ? tabBarFromDocument(document) : null)
        setSheets(document ? sheetsFromDocument(document) : [])
      })
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [container, rainbowSource, replaceLayout])

  return (
    <ScreenLayoutContext.Provider
      value={{
        layoutNodes,
        rainbowSource,
        previewError,
        setRainbowSource,
        bindRainbowScreen,
        flowFocus,
        openFlow: setFlowFocus,
        closeFlow: () => setFlowFocus(null),
        sheets,
        tabBar: tabBarNode,
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
