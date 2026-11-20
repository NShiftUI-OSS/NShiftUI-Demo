import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contents/new')({
  component: ContentCreatePage,
})

function ContentCreatePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Novo conteúdo</h1>
      <p className="text-muted-foreground mt-2">
        Formulário de criação da demo. Sem layout ainda.
      </p>
    </main>
  )
}
