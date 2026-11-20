# CMS-WEB — Agent Harness

SPA do editor NShiftUI. React 19, Vite, Tailwind, TanStack Router. Sem suíte de teste.

Autoridade deste repo: `docs/Harness/INDEX.md`. Os arquivos `docs/01-visao-geral-e-stack.md` e `docs/02-organizacao-de-pastas.md` descrevem uma etapa anterior e não mandam na arquitetura atual.

## Papel

```text
GET /screens/:id  →  Rainbow  →  parser WASM  →  preview no telefone
edição local      →  Publicar →  PUT com a revisão aberta
```

- O desenho da tela é o texto Rainbow que vem do CMS-BACK.
- O telefone é um canvas React. Ele não é a renderização nativa.
- `src/domain/plugins/previews/` reserva um metadata por plugin que existe na plataforma nativa.
- O catálogo do Postgres não gera esses previews.

## Comandos

```bash
npm run dev
npm run build
```

O Vite fica na máquina. O backend sobe com Docker no CMS-BACK.

## Verificação

Mudou preview, layout, fonte, formulário ou rota: abra a tela no navegador e faça o gesto que a mudança cobre. `tsc` não prova que a página abre. O console do Vite não pode ganhar um erro novo.
