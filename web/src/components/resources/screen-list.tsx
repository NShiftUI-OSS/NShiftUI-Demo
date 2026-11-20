import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

function columnsThatFit(available: number, cardWidth: number, gap: number) {
  if (cardWidth <= 0 || available <= 0) return 1
  const fits = Math.floor((available + gap + 1) / (cardWidth + gap))
  if (fits >= 4) return 4
  if (fits >= 2) return 2
  return 1
}

function naturalCardWidth(card: HTMLElement) {
  const phone = card.querySelector<HTMLElement>('[data-phone]')
  if (!phone) return card.getBoundingClientRect().width
  const phoneWidth = phone.getBoundingClientRect().width
  const wrapper = phone.parentElement
  const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null
  const cardStyle = getComputedStyle(card)
  const padding =
    (wrapperStyle ? Number.parseFloat(wrapperStyle.paddingLeft) || 0 : 0) +
    (wrapperStyle ? Number.parseFloat(wrapperStyle.paddingRight) || 0 : 0) +
    (Number.parseFloat(cardStyle.paddingLeft) || 0) +
    (Number.parseFloat(cardStyle.paddingRight) || 0)
  const border =
    (Number.parseFloat(cardStyle.borderLeftWidth) || 0) +
    (Number.parseFloat(cardStyle.borderRightWidth) || 0)
  return phoneWidth + padding + border
}

export function ScreenList({ children }: { children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(1)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const card = list.querySelector<HTMLElement>('[data-screen-card]')
      const phone = card?.querySelector<HTMLElement>('[data-phone]')
      if (!card || !phone || phone.getBoundingClientRect().width <= 0) return
      if (card) observer.observe(card)
      if (phone) observer.observe(phone)
      const grid = card.parentElement
      const gap = grid ? Number.parseFloat(getComputedStyle(grid).columnGap) || 0 : 0
      const next = columnsThatFit(list.clientWidth, naturalCardWidth(card), gap)
      setColumns((current) => (current === next ? current : next))
    }

    const observer = new ResizeObserver(measure)
    const mutations = new MutationObserver(measure)
    observer.observe(list)
    mutations.observe(list, { childList: true, subtree: true })
    measure()
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [])

  return (
    <div ref={listRef} className="screen-list">
      <div
        className="screen-list-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
      >
        {children}
      </div>
    </div>
  )
}
