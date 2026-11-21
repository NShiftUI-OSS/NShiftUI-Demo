import { TriangleAlertIcon } from 'lucide-react'

export function PreviewFidelityNotice() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-4 z-30 flex w-max max-w-[min(28rem,calc(100%-2rem))] items-start gap-3 rounded-lg border border-yellow-500 bg-yellow-300 px-4 py-3 text-sm leading-5 text-yellow-950 shadow-md"
      data-preview-fidelity-notice
      role="note"
    >
      <TriangleAlertIcon
        aria-hidden
        className="mt-0.5 size-5 shrink-0"
        strokeWidth={2.25}
      />
      <p>
        A prévia pode diferir do celular.
        <br />
        Confira no app gerado no Xcode e no Android Studio.
      </p>
    </div>
  )
}
