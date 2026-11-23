# CMS-BACK — Agent Harness

Monólito TypeScript do CMS. Fastify, Postgres 16 e `rainbow-parser-wasm-node`, tudo no Docker. Sem suíte de teste.

Autoridade deste repo: `docs/Harness/INDEX.md`. Os arquivos em `docs/*.md` descrevem o contrato HTTP. O harness diz como isso se liga ao editor e aos plugins nativos.

## Papel

```text
CMS  →  /plugins /events /triggers /screens
app  →  GET /runtime/screens/:name  →  Rainbow concreto
```

- A tela é uma linha. O desenho é `screens.rainbow_source`.
- O catálogo nasce com oito telas em um banco novo. Após publicar alterações no CMS, execute `npm run seed:refresh` para atualizar o snapshot.
- O nome nativo é UpperCamelCase. Quem espelha o plugin na UI é o CMS-WEB.

## Comandos

```bash
docker compose up --build
```

A API publica `https://127.0.0.1:3000`. O Swagger fica em `/docs`. O Postgres não publica porta.
