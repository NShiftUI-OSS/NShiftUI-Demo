# Architecture

O editor abre uma tela pelo UUID.

1. `GET /screens/:id` devolve o Rainbow, a `revision` e a `version` SemVer.
2. `rainbow-parser-wasm-web` monta a árvore. `layoutFromRainbow` em `src/components/screens/rainbow-source.ts` transforma essa árvore nos blocos do telefone.
3. A edição fica no browser. O preview acompanha o texto local.
4. **Publicar** pede confirmação e manda `PUT /screens/:id` com o Rainbow e a revisão que foi aberta. Se o conteúdo mudou, o patch da `version` sobe.
5. Se o backend responder `409` com `code: revision_conflict`, o editor de texto abre um merge em três vias (`src/lib/merge-rainbow.ts`). Os marcadores `<<<<<<<` ficam no texto. O telefone não desenha esse estado.
6. Os outros erros da API aparecem num toast com `error.message` do objeto padrão do backend (`src/lib/report-api-error.ts`).

O container do editor é `createNShiftContainer()` em `src/di/nshift-container.ts`. Ele junta o parser WASM, `plugins.createPreview` e `events.create`.

Pastas que importam esse fluxo:

```text
src/routes/contents/$contentId.tsx     rota da tela
src/components/screens/screen-editor.tsx
src/components/screens/rainbow-editor.tsx
src/components/screens/preview/        desenho React de cada bloco
src/domain/plugins/previews/           metadata do plugin nativo
src/di/registrations.ts                liga previewId ao metadata
```

`docs/01-visao-geral-e-stack.md` e `docs/02-organizacao-de-pastas.md` ficaram de uma etapa em que o painel ainda não existia. Não use essa árvore como mapa.
