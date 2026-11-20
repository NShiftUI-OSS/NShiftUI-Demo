# Arquitetura

Monólito TypeScript.

- `src/domain` valida nome, versão, trigger e o Rainbow inicial. Não importa Fastify nem Postgres.
- `src/application` tem um use case por ação. Ele recebe interfaces.
- `src/infrastructure` implementa Postgres e o `rainbow-parser-wasm-node`.
- `src/composition` monta o container. É o único lugar que liga implementação a interface.
- `src/interfaces/http` traduz status e os dois objetos de resposta.

Não há suíte de teste nesta POC.
