import { TriangleAlertIcon } from 'lucide-react'

export function PreviewFidelityNotice() {
  return (
    <div
      className="pointer-events-none flex shrink-0 items-center gap-2 border-b border-yellow-500/70 bg-yellow-300 px-4 py-2 text-sm leading-5 text-yellow-950"
      data-preview-fidelity-notice
      role="note"
    >
      <TriangleAlertIcon
        aria-hidden
        className="size-4 shrink-0"
        strokeWidth={2.25}
      />
      <p className="min-w-0">
        A prévia pode diferir do celular. Confira no app gerado no Xcode e no Android Studio.
      </p>
    </div>
  )
}
