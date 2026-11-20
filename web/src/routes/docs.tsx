import { createFileRoute } from '@tanstack/react-router'

import { RuntimeDoc } from '@/components/docs/runtime-doc'

export const Route = createFileRoute('/docs')({
  component: DocsPage,
})

function DocsPage() {
  return <RuntimeDoc />
}
