import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

import { isScnIcon } from '@/scn/icons'

export function ScnIconMark({
  name,
  size = 16,
}: {
  name: string
  size?: number
}) {
  if (!isScnIcon(name)) {
    return (
      <span
        aria-hidden="true"
        className="inline-block rounded-sm border border-current"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <DynamicIcon
      name={name as IconName}
      size={size}
      fallback={() => (
        <span
          aria-hidden="true"
          className="inline-block rounded-sm border border-current"
          style={{ width: size, height: size }}
        />
      )}
    />
  )
}
