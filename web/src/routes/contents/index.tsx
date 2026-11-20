import { createFileRoute } from '@tanstack/react-router'

import { ResourcePage } from '@/components/resources/resource-page'

export const Route = createFileRoute('/contents/')({
  component: ContentListPage,
})

function ContentListPage() {
  return <ResourcePage />
}
