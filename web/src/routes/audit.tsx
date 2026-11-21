import { createFileRoute } from '@tanstack/react-router'

import { AuditLogPage } from '@/components/audit/audit-log-page'

export const Route = createFileRoute('/audit')({
  component: AuditPage,
})

function AuditPage() {
  return <AuditLogPage />
}
