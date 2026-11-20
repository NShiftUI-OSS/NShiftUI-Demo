import { useId } from 'react'

export function NShiftMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-base`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#111a29" />
          <stop offset="1" stopColor="#05070f" />
        </linearGradient>
        <linearGradient id={`${id}-lower`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#616e82" />
          <stop offset="1" stopColor="#232936" />
        </linearGradient>
        <linearGradient id={`${id}-middle`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#aeb8c9" />
          <stop offset="1" stopColor="#6e788a" />
        </linearGradient>
        <linearGradient id={`${id}-upper`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f0f2fa" />
          <stop offset="1" stopColor="#aeb8c9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill={`url(#${id}-base)`} />
      <path
        d="M31 29 Q32 28 34 29 L53 39 Q56 41 53 43 L34 54 Q32 55 30 54 L11 43 Q8 41 11 39Z"
        fill={`url(#${id}-lower)`}
        stroke="#788395"
        strokeWidth="0.7"
      />
      <path
        d="M31 21 Q32 20 34 21 L53 31 Q56 33 53 35 L34 46 Q32 47 30 46 L11 35 Q8 33 11 31Z"
        fill={`url(#${id}-middle)`}
        stroke="#c3cad5"
        strokeWidth="0.7"
      />
      <path
        d="M31 10 Q32 9 34 10 L53 20 Q56 22 53 24 L34 35 Q32 36 30 35 L11 24 Q8 22 11 20Z"
        fill={`url(#${id}-upper)`}
        stroke="#f8f9ff"
        strokeWidth="0.7"
      />
    </svg>
  )
}
