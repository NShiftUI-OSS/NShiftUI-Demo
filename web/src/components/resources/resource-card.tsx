import type { LucideIcon } from 'lucide-react'
import { ArrowUpRightIcon, BoxesIcon } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export type ResourceKind = 'screen'

type ResourceCardProps = {
  kind: ResourceKind
  name: string
  description: string
  icon?: LucideIcon
  onClick?: () => void
}

export function ResourceCard({
  kind,
  name,
  description,
  icon: Icon,
  onClick,
}: ResourceCardProps) {
  const DefaultIcon = BoxesIcon

  return (
    <Card
      className="group relative w-full cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick?.()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {kind === 'screen' ? (
        <div className="bg-muted/60 m-3 flex h-32 shrink-0 items-center justify-center rounded-lg border">
          <div className="bg-background text-muted-foreground flex h-24 w-14 items-center justify-center rounded-xl border text-[10px]">
            Preview
          </div>
        </div>
      ) : (
        <div className="bg-muted/60 m-3 flex h-32 shrink-0 items-center justify-center rounded-lg border">
          {Icon ? (
            <Icon className="text-muted-foreground size-8" />
          ) : (
            <DefaultIcon className="text-muted-foreground size-8" />
          )}
        </div>
      )}
      <CardHeader className="min-h-24 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{name}</CardTitle>
            <CardDescription className="mt-1 line-clamp-3">
              {description}
            </CardDescription>
          </div>
          <ArrowUpRightIcon className="text-muted-foreground size-4 shrink-0" />
        </div>
      </CardHeader>
    </Card>
  )
}
