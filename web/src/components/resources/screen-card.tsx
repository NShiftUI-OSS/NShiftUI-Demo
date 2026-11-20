import { ArrowUpRightIcon } from 'lucide-react'

import { ScreenRainbowPreview } from '@/components/screens/screen-rainbow-preview'
import { displayScreenName } from '@/lib/display-screen-name'
import { Badge } from '@/components/ui/badge'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ScreenCardProps = {
  name: string
  description: string
  rainbow: string
  isRoot: boolean
  onClick?: () => void
}

export function ScreenCard({
  name,
  description,
  rainbow,
  isRoot,
  onClick,
}: ScreenCardProps) {
  return (
    <Card
      className="screen-card group relative shrink-0 cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
      data-screen-card=""
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
      <div className="flex shrink-0 items-center justify-center px-4 py-6">
        <ScreenRainbowPreview rainbow={rainbow} />
      </div>
      <CardHeader className="pt-1 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle title={name}>{displayScreenName(name)}</CardTitle>
              {isRoot && (
                <Badge variant="destructive">Root</Badge>
              )}
            </div>
            <CardDescription className="mt-1 line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <ArrowUpRightIcon className="text-muted-foreground size-4 shrink-0" />
        </div>
      </CardHeader>
    </Card>
  )
}
