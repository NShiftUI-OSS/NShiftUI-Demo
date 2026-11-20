import type { ReactNode } from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

type PageSubheaderProps = {
  title: string
  screenName?: string
  version?: string
  subtitle?: string
  actions?: ReactNode
  onBack?: () => void
}

export function PageSubheader({
  title,
  screenName,
  version,
  subtitle,
  actions,
  onBack,
}: PageSubheaderProps) {
  return (
    <header className="bg-background/95 flex h-14 shrink-0 items-center gap-3 overflow-x-auto border-b px-4 backdrop-blur">
      <Button
        aria-label="Voltar"
        className="shrink-0"
        size="icon-sm"
        variant="ghost"
        onClick={onBack ?? (() => window.history.back())}
      >
        <ArrowLeftIcon />
      </Button>
      <div className="flex min-w-0 flex-col justify-center">
        <h1
          className="truncate text-base leading-5 font-semibold"
          data-screen-name={screenName}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="text-muted-foreground truncate text-xs leading-4"
            data-screen-version={version}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="ml-auto flex shrink-0 items-center gap-4">{actions}</div> : null}
    </header>
  )
}
