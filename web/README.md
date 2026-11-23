# CMS-WEB

Painel web do CMS (POC do TCC). React, Vite e TypeScript. O backend em `../back` publica telas Rainbow para os apps iOS e Android. O preview usa RainbowParser WASM `1.0.0`.

- [Stack e escopo](docs/01-visao-geral-e-stack.md)
- [Organização de pastas](docs/02-organizacao-de-pastas.md)

## Requisitos

- Node.js com npm

## Comandos

```bash
npm install
npm run dev
```

| Script            | Função                      |
| ----------------- | --------------------------- |
| `npm run dev`     | Servidor de desenvolvimento |
| `npm run build`   | Build de produção           |
| `npm run preview` | Preview do build            |
| `npm run lint`    | ESLint                      |
| `npm run format`  | Prettier                    |

O template inclui o React Compiler. Detalhes na documentação.
