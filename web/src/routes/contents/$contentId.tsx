import { createFileRoute } from '@tanstack/react-router'

import { ScreenEditor } from '@/components/screens/screen-editor'

export const Route = createFileRoute('/contents/$contentId')({
  component: ScreenEditorPage,
})

function ScreenEditorPage() {
  const { contentId } = Route.useParams()

  return <ScreenEditor screenId={contentId} />
}
