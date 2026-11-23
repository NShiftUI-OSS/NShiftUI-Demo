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
    <header className="bg-background/95 flex min-h-14 min-w-0 shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2 backdrop-blur">
      <div className="flex min-w-0 max-w-full items-center gap-3">
        <Button
          aria-label="Voltar"
          className="shrink-0"
          size="icon-sm"
          variant="ghost"
          onClick={onBack ?? (() => window.history.back())}
        >
          <ArrowLeftIcon />
        </Button>
        <div className="flex min-w-0 max-w-52 flex-col justify-center">
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
      </div>
      {actions ? (
        <div className="min-w-0 max-w-full flex-auto">{actions}</div>
      ) : null}
    </header>
  )
}
