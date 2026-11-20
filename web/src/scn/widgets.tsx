import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

type TextStyle = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xl2'
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'

export function ScnText({
  children,
  style = 'sm',
  weight,
  color,
  align,
}: {
  children: ReactNode
  style?: TextStyle
  weight?: 'medium' | 'semibold'
  color?: 'muted' | 'primary' | 'destructive'
  align?: 'center'
}) {
  return (
    <p
      className="scn-text"
      data-align={align}
      data-color={color}
      data-style={style}
      data-weight={weight}
    >
      {children}
    </p>
  )
}

export function ScnButton({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'icon'
  disabled?: boolean
}) {
  return (
    <span className="scn-button" data-disabled={disabled} data-size={size} data-variant={variant}>
      {children}
    </span>
  )
}

export function ScnField({
  placeholder,
  value,
}: {
  placeholder: string
  value?: string
}) {
  return (
    <div className="scn-field" data-placeholder={value ? undefined : 'true'}>
      {value || placeholder}
    </div>
  )
}

export function ScnTextarea({ placeholder }: { placeholder: string }) {
  return (
    <div className="scn-textarea" data-placeholder="true">
      {placeholder}
    </div>
  )
}

export function ScnSelect({ value }: { value: string }) {
  return (
    <div className="scn-select">
      <span>{value}</span>
      <i aria-hidden>⌄</i>
    </div>
  )
}

export function ScnBadge({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link'
}) {
  return (
    <span className="scn-badge" data-variant={variant}>
      {children}
    </span>
  )
}

export function ScnCard({ children }: { children: ReactNode }) {
  return <div className="scn-card">{children}</div>
}

export function ScnSwitch({ label, on = true }: { label: string; on?: boolean }) {
  return (
    <span className="scn-switch" data-on={on}>
      <i />
      {label}
    </span>
  )
}

export function ScnCheck({ label, on = true }: { label: string; on?: boolean }) {
  return (
    <span className="scn-check" data-on={on}>
      <i />
      {label}
    </span>
  )
}

export function ScnRadio({ label, on = true }: { label: string; on?: boolean }) {
  return (
    <span className="scn-radio" data-on={on}>
      <i />
      {label}
    </span>
  )
}

export function ScnSeparator({ axis = 'horizontal' }: { axis?: 'horizontal' | 'vertical' }) {
  return <div className="scn-separator" data-axis={axis} />
}

export function ScnButtonGroup({ titles }: { titles: string[] }) {
  return (
    <div className="scn-button-group">
      {titles.map((title) => (
        <span key={title} className="scn-button">
          {title}
        </span>
      ))}
    </div>
  )
}

export function ScnToggleGroup({ options, selected }: { options: string[]; selected: string }) {
  return (
    <div className="scn-toggle-group">
      {options.map((option) => (
        <span key={option} data-on={option === selected}>
          {option}
        </span>
      ))}
    </div>
  )
}

export function ScnAvatar({
  letters,
  size = 'default',
}: {
  letters: string
  size?: 'sm' | 'default' | 'lg'
}) {
  return (
    <span className="scn-avatar" data-size={size}>
      {letters}
    </span>
  )
}

export function ScnAlert({ title, body, destructive = false }: { title: string; body: string; destructive?: boolean }) {
  return (
    <div className="scn-alert" data-variant={destructive ? 'destructive' : 'default'}>
      <ScnText weight="medium">{title}</ScnText>
      <ScnText color={destructive ? 'destructive' : 'muted'}>{body}</ScnText>
    </div>
  )
}

export function ScnProgress({ value = 0.6 }: { value?: number }) {
  const width = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`
  return (
    <div className="scn-progress">
      <span style={{ width }} />
    </div>
  )
}

export function ScnSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 8, width: '100%' }}>
      <div className="scn-skeleton" />
      <div className="scn-skeleton" data-tall="true" />
    </div>
  )
}

export function ScnSpinner() {
  return <span className="scn-spinner" />
}

export function ScnTabs({
  titles,
  selected,
}: {
  titles: string[]
  selected: string
}) {
  return (
    <div className="scn-tabs">
      {titles.map((title) => (
        <span key={title} data-active={title === selected}>
          {title}
        </span>
      ))}
    </div>
  )
}

export function ScnSlider({ value = 0.45 }: { value?: number }) {
  const percent = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`
  return (
    <div className="scn-slider">
      <span />
      <i style={{ width: percent }} />
      <b style={{ left: `calc(${percent} - 8px)` }} />
    </div>
  )
}

export function ScnToast({ title, body }: { title: string; body: string }) {
  return (
    <div className="scn-toast">
      <ScnText weight="medium">{title}</ScnText>
      <ScnText color="muted" style="xs">
        {body}
      </ScnText>
    </div>
  )
}

export function ScnImage() {
  return <div className="scn-image" />
}

export function ScnLabel({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="scn-label">
      <ScnText weight="medium">{label}</ScnText>
      {children}
      {hint ? (
        <ScnText color="muted" style="xs">
          {hint}
        </ScnText>
      ) : null}
    </label>
  )
}

export function ScnCalendar() {
  const visible = new Date()
  const year = visible.getFullYear()
  const month = visible.getMonth()
  const title = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(visible)
  const first = new Date(year, month, 1)
  const leading = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { day: number; outside: boolean }[] = []
  for (let index = 0; index < leading; index += 1) {
    const date = new Date(year, month, index - leading + 1)
    cells.push({ day: date.getDate(), outside: true })
  }
  for (let day = 1; day <= daysInMonth; day += 1) cells.push({ day, outside: false })
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, outside: true })
    nextDay += 1
  }
  const today = visible.getDate()
  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

  return (
    <div className="scn-calendar">
      <header>
        <ScnButton size="icon" variant="ghost">
          <ChevronLeft size={16} />
        </ScnButton>
        <strong>{title}</strong>
        <ScnButton size="icon" variant="ghost">
          <ChevronRight size={16} />
        </ScnButton>
      </header>
      <div className="scn-calendar-grid">
        {weekdays.map((day) => (
          <span key={day} data-muted="true">
            {day}
          </span>
        ))}
        {cells.map((cell, index) => (
          <span
            key={`${cell.day}-${index}`}
            data-active={!cell.outside && cell.day === today}
            data-muted={cell.outside}
            data-today={!cell.outside && cell.day === today}
          >
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ScnOtp({ length = 6, code = '' }: { length?: number; code?: string }) {
  return (
    <div className="scn-otp">
      {Array.from({ length }, (_, index) => (
        <i key={index}>{code[index] ?? ''}</i>
      ))}
    </div>
  )
}

export function ScnItem({
  title,
  subtitle,
  initials,
}: {
  title: string
  subtitle?: string
  initials?: string
}) {
  return (
    <div className="scn-item">
      {initials ? <ScnAvatar letters={initials} /> : null}
      <span>
        <ScnText weight="medium">{title}</ScnText>
        {subtitle ? (
          <ScnText color="muted" style="xs">
            {subtitle}
          </ScnText>
        ) : null}
      </span>
    </div>
  )
}

export function ScnAttachment({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="scn-attachment">
      <i />
      <span>
        <ScnText weight="medium">{title}</ScnText>
        <ScnText color="muted" style="xs">
          {detail}
        </ScnText>
      </span>
    </div>
  )
}
