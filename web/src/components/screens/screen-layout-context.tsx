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
  scrollFromDocument,
  sheetsFromDocument,
  tabBarFromDocument,
  searchBarFromDocument,
  floatingButtonFromDocument,
  toastsFromDocument,
  webViewFromDocument,
  type PreviewSheet,
  type PreviewToast,
  type ScreenScrollPreview,
} from '@/components/screens/rainbow-source'
import {
  defaultRainbowSource,
  readRainbowDocument,
  rootContainer,
  type RootContainer,
} from '@/components/screens/rainbow-document'
import { useNShift } from '@/di/nshift-provider'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'

export type ScreenLayoutNode = {
  id: string
  componentId: string
  plugin?: NShiftPluginModel | null
  props?: Record<string, string | number | boolean | string[]>
  children: ScreenLayoutNode[]
}

export type { PreviewSheet, PreviewToast }

type ScreenLayoutContextValue = {
  layoutNodes: ScreenLayoutNode[]
  rainbowSource: string
  previewError: boolean
  scroll: ScreenScrollPreview
  setRainbowSource: (source: string) => void
  bindRainbowScreen: (screenId: string, source?: string) => void
  flowFocus: string | null
  openFlow: (nodeId: string) => void
  closeFlow: () => void
  sheets: PreviewSheet[]
  toasts: PreviewToast[]
  /** Root plugin container of the document (Screen or WebView). */
  rootKind: RootContainer | null
  webView: { url: string } | null
  tabBar: ScreenLayoutNode | null
  searchBar: ScreenLayoutNode | null
  floatingButton: ScreenLayoutNode | null
}

const ScreenLayoutContext = createContext<ScreenLayoutContextValue | null>(null)

export function ScreenLayoutProvider({ children }: { children: ReactNode }) {
  const container = useNShift()
  const boundScreenRef = useRef<string | null>(null)
  const [layoutNodes, setLayoutNodes] = useState<ScreenLayoutNode[]>([])
  const [tabBarNode, setTabBarNode] = useState<ScreenLayoutNode | null>(null)
  const [searchBarNode, setSearchBarNode] = useState<ScreenLayoutNode | null>(null)
  const [floatingButtonNode, setFloatingButtonNode] = useState<ScreenLayoutNode | null>(null)
  const [sheets, setSheets] = useState<PreviewSheet[]>([])
  const [toasts, setToasts] = useState<PreviewToast[]>([])
  const [rootKind, setRootKind] = useState<RootContainer | null>(null)
  const [webView, setWebView] = useState<{ url: string } | null>(null)
  const [rainbowSource, setRainbowSourceState] = useState('')
  const [previewError, setPreviewError] = useState(false)
  const [scroll, setScroll] = useState<ScreenScrollPreview>({
    isLazy: false,
    header: [],
    footer: [],
  })
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
        setSearchBarNode(document ? searchBarFromDocument(document) : null)
        setFloatingButtonNode(document ? floatingButtonFromDocument(document) : null)
        setSheets(document ? sheetsFromDocument(document) : [])
        setToasts(document ? toastsFromDocument(document) : [])
        setRootKind(document ? rootContainer(document) : null)
        setWebView(document ? webViewFromDocument(document) : null)
        setScroll(
          document
            ? scrollFromDocument(document)
            : { isLazy: false, header: [], footer: [] },
        )
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
        scroll,
        setRainbowSource,
        bindRainbowScreen,
        flowFocus,
        openFlow: setFlowFocus,
        closeFlow: () => setFlowFocus(null),
        sheets,
        toasts,
        rootKind,
        webView,
        tabBar: tabBarNode,
        searchBar: searchBarNode,
        floatingButton: floatingButtonNode,
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
