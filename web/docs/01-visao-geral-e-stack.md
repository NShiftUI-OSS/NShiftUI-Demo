# CMS-WEB — visão geral e stack

Documento inicial da POC de frontend do CMS. Este repositório é o painel web (React + Vite) usado para demonstrar o TCC: gestão de conteúdo que, numa fase posterior, será servido aos apps mobile pelo backend na DSL Rainbow.

A stack está instalada e ligada no app. A organização de pastas está em [02-organizacao-de-pastas.md](02-organizacao-de-pastas.md). As rotas da demo existem; o layout do painel ainda não.

## O que este projeto é

- Painel administrativo em **TypeScript**, SPA com **Vite**.
- POC para banca: fluxo funcional e arquitetura explicável, não produto em produção.
- Idioma da interface: **somente português**. Sem biblioteca de i18n.
- Repositório alvo: **CMS-WEB**. O parser (`RainbowParser-Rust`) não entra nesta fase.
- **CMS-BACK** (autenticação, contrato de API e dados reais) vem depois de o front estar montado.

## O que já está no app

1. Scaffold **Vite + React + TypeScript**, com **React Compiler**.
2. **shadcn/ui** (preset Nova) com Tailwind 4, alias `@/` e componentes `button`, `card`, `input`, `label`, `table`, `sonner` e `field`. O CLI atual não gera `form`; formulários usam `field` com React Hook Form e Zod.
3. Plugins do **TanStack Router** e do **Tailwind** no Vite. `eslint-config-prettier` no ESLint.
4. Providers no `main.tsx`: `next-themes` (tema do sistema), TanStack Query e TanStack Router.
5. Rotas placeholder, com paths em inglês: `/`, `/contents`, `/contents/new`, `/contents/$contentId`. Sem sidebar e sem shell. Os rótulos da tela continuam em português.
6. Pastas do plano criadas. Onde ainda não há código, há `.gitkeep`.
7. Prettier com `.prettierrc.json` (sem ponto e vírgula, aspas simples), alinhado ao código do projeto. `src/routeTree.gen.ts` fica fora do Prettier e do ESLint e **entra no Git** (o `tsc` do build roda antes do Vite).

`cn()` vem do pacote `cn`. `clsx` e `tailwind-merge` não são dependências diretas.

## O que ainda não foi feito (de propósito)

- Layout do painel (sidebar e área principal).
- Modelo do item de conteúdo e roteiro da demo do TCC.
- Autenticação e cliente de API. HTTP será `fetch` quando o CMS-BACK existir.
- Testes automatizados.

## Stack instalada

Versões abaixo são as gravadas no `package.json` no momento da instalação (ranges `^` / `~`). O lockfile fixa a resolução exata.

### Já vinham do scaffold Vite

| Pacote                                                                                    | Papel                         |
| ----------------------------------------------------------------------------------------- | ----------------------------- |
| `react`, `react-dom`                                                                      | UI (React 19)                 |
| `vite`, `@vitejs/plugin-react`                                                            | Bundler e dev server (Vite 8) |
| `typescript`                                                                              | Linguagem                     |
| `babel-plugin-react-compiler`, `@babel/core`, `@rolldown/plugin-babel`                    | React Compiler no build       |
| `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Lint                          |

### Dependências de runtime adicionadas

| Pacote                           | Papel                                                                     |
| -------------------------------- | ------------------------------------------------------------------------- |
| `@tanstack/react-router`         | Rotas tipadas da SPA                                                      |
| `@tanstack/react-query`          | Server state (cache, loading, refetch) — uso real quando houver API       |
| `@tanstack/react-table`          | Lógica de tabela (sort, paginação, filtros); a UI virá do Table do shadcn |
| `zustand`                        | Estado de UI no cliente (sidebar, preferências locais)                    |
| `react-hook-form`                | Formulários                                                               |
| `zod`                            | Schemas e validação (inclusive datas no submit)                           |
| `@hookform/resolvers`            | Liga React Hook Form ao Zod                                               |
| `cn`, `class-variance-authority` | `cn()` e variantes do shadcn                                              |
| `lucide-react`                   | Ícones                                                                    |
| `sonner`                         | Toasts (componente em `components/ui/sonner`)                             |
| `date-fns`                       | Formatação e cálculo de datas na tela                                     |
| `next-themes`                    | Tema claro e escuro                                                       |

### Dependências de desenvolvimento adicionadas

| Pacote                             | Papel                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| `tailwindcss`, `@tailwindcss/vite` | Tailwind CSS 4, exigido pelo shadcn                   |
| `@tanstack/router-plugin`          | Gera `src/routeTree.gen.ts` a partir de `src/routes/` |
| `prettier`                         | Formatação (`.prettierrc.json`)                       |
| `eslint-config-prettier`           | Desliga regras do ESLint que brigam com o Prettier    |

### Sem pacote npm

| Decisão                | Motivo                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| HTTP com `fetch`       | API nativa do browser; sem Axios nem ky                                                 |
| Idioma só em português | Sem lib de i18n                                                                         |
| Testes                 | Nenhum (sem Vitest, Testing Library ou Playwright)                                      |
| shadcn/ui              | O CLI copia componentes para `src/components/ui`. Não é um pacote de componentes pronto |

## Decisões de produto (resumo)

- **Design system:** shadcn/ui em cima de Tailwind. Não substituir Tailwind por CSS puro.
- **Tema:** light e dark.
- **Autenticação:** só quando o CMS-BACK existir.
- **Dados:** o front é montado primeiro; contrato e integração com o backend vêm em seguida.
- **Qualidade:** ESLint + Prettier. Sem suíte de testes automatizados; validação manual e demo na apresentação.

## Scripts

Na raiz do repositório:

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # checagem TypeScript + build de produção
npm run preview   # servir o build
npm run lint      # ESLint
npm run format    # Prettier (escreve nos arquivos)
```

## Próximo passo de implementação

1. Layout do painel em `components/layout` e uso dele em `routes/__root.tsx`.
2. Modelo do item de conteúdo (campos e status) e roteiro da demo do TCC.
3. Autenticação e contrato com o CMS-BACK, quando o backend existir.
