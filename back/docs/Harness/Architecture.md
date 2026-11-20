# Architecture

Clean architecture, um use case por ação, DI manual em `src/composition/container.ts`.

```text
src/domain            nomes, versão, trigger, Rainbow inicial
src/application       use cases e ports
src/infrastructure    Postgres e o WASM do Node
src/composition       liga as implementações
src/interfaces/http   Fastify, Zod, status, OpenAPI
```

Sucesso é `{ "data": T }`. Erro é `{ "error": { "status", "code", "message" } }`. O status HTTP escolhe o objeto. Não há campo `ok`.

Status usados: 200, 201, 400, 404, 409, 422, 500. `401` e `403` ficam para uma autenticação futura.

`PUT /screens/:id` exige a `revision` que o editor abriu. Se a linha já avançou, a resposta é `409` com `code: revision_conflict` e o Rainbow não muda. O WASM formata antes de gravar. Rainbow inválido é `422` `invalid_rainbow` e a linha também não muda. Conteúdo igual ao gravado não aumenta `revision` nem o patch de `version`. Uma alteração grava o Rainbow, soma a `revision` e o patch, e acrescenta a linha em `screen_versions`.

Detalhe das rotas: `docs/resources.md`, `docs/rainbow.md`, `docs/runtime.md`, `docs/docker.md`.
