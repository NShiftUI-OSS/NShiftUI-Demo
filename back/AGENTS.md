# CMS-BACK — Agent Harness

Monólito TypeScript do CMS. Fastify, Postgres 16 e `rainbow-parser-wasm-node`, tudo no Docker. Sem suíte de teste.

Autoridade deste repo: `docs/Harness/INDEX.md`. Os arquivos em `docs/*.md` descrevem o contrato HTTP. O harness diz como isso se liga ao editor e aos plugins nativos.

## Papel

```text
CMS  →  /plugins /events /triggers /screens
app  →  GET /runtime/screens/:name  →  Rainbow concreto
```

- A tela é uma linha. O desenho é `screens.rainbow_source`.
- O catálogo nasce vazio. Uma linha de plugin não desenha o telefone.
- O nome nativo é UpperCamelCase. Quem espelha o plugin na UI é o CMS-WEB.

## Comandos

```bash
docker compose up --build
```

A API publica `http://localhost:3000`. O Swagger fica em `/docs`. O Postgres não publica porta.
