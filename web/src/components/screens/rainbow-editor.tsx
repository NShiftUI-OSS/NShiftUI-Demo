import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTheme } from '@/components/layout/theme'

import { Button } from '@/components/ui/button'

import {
  highlightRainbow,
  type RainbowTokenColor,
} from '@/components/screens/rainbow-highlight'
import { useScreenLayout } from '@/components/screens/screen-layout-context'
import { useNShift } from '@/di/nshift-provider'
import { cn } from '@/lib/utils'

const darkColors: Record<RainbowTokenColor, string> = {
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
}

const lightColors: Record<RainbowTokenColor, string> = {
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
}

const editorTextClass =
  'm-0 box-border p-4 font-mono text-[13px] leading-6 whitespace-pre [tab-size:2]'

function measureCaret(textarea: HTMLTextAreaElement) {
  if (
    document.activeElement !== textarea ||
    textarea.selectionStart !== textarea.selectionEnd
  ) {
    return null
  }

  const style = getComputedStyle(textarea)
  const mirror = document.createElement('div')
  mirror.style.position = 'fixed'
  mirror.style.left = '-9999px'
  mirror.style.top = '0'
  mirror.style.visibility = 'hidden'
  mirror.style.overflow = 'hidden'
  mirror.style.width = `${textarea.clientWidth}px`
  for (const property of [
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'lineHeight',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'tabSize',
    'whiteSpace',
  ] as const) {
    mirror.style[property] = style[property]
  }

  const marker = document.createElement('span')
  marker.textContent = 'M'
  mirror.append(textarea.value.slice(0, textarea.selectionStart), marker)
  document.body.append(mirror)
  const top = marker.offsetTop - textarea.scrollTop
  const left = marker.offsetLeft - textarea.scrollLeft
  const height = marker.offsetHeight
  mirror.remove()

  return { top, left, height }
}

export function RainbowEditor({
  screenId,
  initialSource,
  notice,
  readOnly = false,
  width,
  active,
  onWidthChange,
  onEqualize,
  onClose,
}: {
  screenId: string
  initialSource: string
  notice?: string | null
  readOnly?: boolean
  width: number
  active: boolean
  onWidthChange: (width: number) => void
  onEqualize: () => void
  onClose: () => void
}) {
  const container = useNShift()
  const { bindRainbowScreen, rainbowSource, setRainbowSource } =
    useScreenLayout()
  const source = rainbowSource
  const { resolvedTheme } = useTheme()
  const colors = resolvedTheme === 'light' ? lightColors : darkColors
  const backdropRef = useRef<HTMLPreElement>(null)
  const caretRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const splitGesture = useRef({ time: 0, x: 0, y: 0, dragged: false })
  const [dragging, setDragging] = useState(false)
  const tokens = highlightRainbow(source)
  const lineCount = source.split('\n').length

  useEffect(() => {
    bindRainbowScreen(screenId, initialSource)
  }, [bindRainbowScreen, initialSource, screenId])

  const syncCaret = useCallback(() => {
    const textarea = textareaRef.current
    const caret = caretRef.current
    if (!textarea || !caret) return
    const position = measureCaret(textarea)
    if (!position) {
      caret.style.visibility = 'hidden'
      return
    }
    caret.style.visibility = 'visible'
    caret.style.height = `${position.height}px`
    caret.style.transform = `translate(${position.left}px, ${position.top}px)`
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const sync = () => syncCaret()
    sync()
    textarea.addEventListener('scroll', sync)
    textarea.addEventListener('keyup', sync)
    textarea.addEventListener('click', sync)
    textarea.addEventListener('focus', sync)
    textarea.addEventListener('blur', sync)
    document.addEventListener('selectionchange', sync)
    return () => {
      textarea.removeEventListener('scroll', sync)
      textarea.removeEventListener('keyup', sync)
      textarea.removeEventListener('click', sync)
      textarea.removeEventListener('focus', sync)
      textarea.removeEventListener('blur', sync)
      document.removeEventListener('selectionchange', sync)
    }
  }, [syncCaret, source])

  const formatSource = useCallback(async () => {
    const result = await container.parser.format(source)
    if (result.ok && result.formatted) setRainbowSource(result.formatted)
  }, [container, setRainbowSource, source])

  useEffect(() => {
    if (!active) return

    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey || !event.shiftKey || event.key.toLowerCase() !== 'f') {
        return
      }
      event.preventDefault()
      void formatSource()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, formatSource])

  function startResize(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    const gesture = splitGesture.current
    const now = event.timeStamp
    const isDouble =
      !gesture.dragged &&
      gesture.time > 0 &&
      now - gesture.time < 500 &&
      Math.abs(event.clientX - gesture.x) < 8 &&
      Math.abs(event.clientY - gesture.y) < 8

    if (isDouble) {
      gesture.time = 0
      gesture.dragged = false
      onEqualize()
      return
    }

    gesture.time = now
    gesture.x = event.clientX
    gesture.y = event.clientY
    gesture.dragged = false

    const startX = event.clientX
    const pane = event.currentTarget.closest('[data-editor-pane]')
    const measured =
      pane instanceof HTMLElement ? pane.getBoundingClientRect().width : width
    const startWidth = measured > 0 ? measured : width

    const row = event.currentTarget.closest('[data-editor-row]')
    const phone = row?.querySelector('[data-phone]')
    const slot = row?.querySelector('[data-phone-slot]')
    const slotStyle =
      slot instanceof HTMLElement ? getComputedStyle(slot) : null
    const reserved =
      phone instanceof HTMLElement && slotStyle
        ? phone.offsetWidth +
          Number.parseFloat(slotStyle.paddingLeft) +
          Number.parseFloat(slotStyle.paddingRight)
        : 0
    const available = row instanceof HTMLElement ? row.clientWidth : 960
    const maxWidth = Math.max(280, available - reserved)
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect

    function move(moveEvent: PointerEvent) {
      if (Math.abs(moveEvent.clientX - startX) > 4) gesture.dragged = true
      const next = startWidth + startX - moveEvent.clientX
      if (next < 160) {
        stop()
        onClose()
        return
      }
      onWidthChange(Math.min(Math.max(next, 280), maxWidth))
    }

    function stop() {
      setDragging(false)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    setDragging(true)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  return (
    <aside className="bg-card relative flex h-full min-h-0 w-full min-w-0 flex-col border-l">
      <button
        aria-label="Redimensionar editor Rainbow. Duplo clique divide em 50%."
        title="Arraste para redimensionar. Duplo clique divide em 50%."
        className="group absolute inset-y-0 -left-2 z-20 flex w-4 cursor-col-resize touch-none items-center justify-center border-0 bg-transparent p-0 select-none"
        type="button"
        onPointerDown={startResize}
      >
        <span
          aria-hidden
          className={cn(
            'bg-foreground/25 group-hover:bg-foreground/70 absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors',
            dragging && 'bg-foreground/70',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'border-foreground/25 bg-muted relative flex h-14 w-3.5 flex-col items-center justify-center gap-1 rounded-full border shadow-sm transition-colors',
            'group-hover:border-foreground/55',
            dragging && 'border-foreground/70 bg-accent',
          )}
        >
          <span className="bg-foreground/80 size-[3px] rounded-full" />
          <span className="bg-foreground/80 size-[3px] rounded-full" />
          <span className="bg-foreground/80 size-[3px] rounded-full" />
        </span>
      </button>
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-4 text-xs font-medium">
        Rainbow
        <Button
          className="h-7 px-2 text-xs"
          size="sm"
          title="Formatar (Alt+Shift+F)"
          variant="ghost"
          onClick={() => void formatSource()}
        >
          Formatar
        </Button>
      </div>
      {notice && (
        <p className="bg-muted text-foreground border-b px-4 py-2 text-xs leading-5">
          {notice}
        </p>
      )}
      <div className="flex min-h-0 flex-1">
        <div
          ref={gutterRef}
          aria-hidden
          className="text-muted-foreground w-12 shrink-0 overflow-hidden border-r pt-4 pr-2 text-right font-mono text-[13px] leading-6 select-none"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <pre
            ref={backdropRef}
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 overflow-hidden',
              editorTextClass,
            )}
          >
            {tokens.map((token, index) => (
              <span key={index} style={{ color: colors[token.color] }}>
                {token.text}
              </span>
            ))}
            {source.endsWith('\n') ? '\n ' : null}
          </pre>
          <div
            ref={caretRef}
            aria-hidden
            className="bg-foreground pointer-events-none absolute top-0 left-0 z-[1] w-px"
            style={{
              animation: 'rainbow-caret 1.06s steps(1, end) infinite',
              visibility: 'hidden',
            }}
          />
          <textarea
            ref={textareaRef}
            aria-label="Editor Rainbow"
            className={cn(
              'absolute inset-0 resize-none overflow-auto border-0 bg-transparent text-transparent caret-transparent outline-none',
              editorTextClass,
            )}
            readOnly={readOnly}
            spellCheck={false}
            value={source}
            onChange={(event) => {
              if (readOnly) return
              setRainbowSource(event.target.value)
            }}
            onScroll={(event) => {
              const top = event.currentTarget.scrollTop
              const left = event.currentTarget.scrollLeft
              if (backdropRef.current) {
                backdropRef.current.scrollTop = top
                backdropRef.current.scrollLeft = left
              }
              if (gutterRef.current) gutterRef.current.scrollTop = top
            }}
          />
        </div>
      </div>
    </aside>
  )
}
