# Organização de pastas

A SPA separa URL, domínio e design system. Pastas, arquivos e paths de rota ficam em inglês. Os textos visíveis da interface continuam em português.

Imports seguem uma direção: `routes/` → `features/` → infra compartilhada (`layout`, `shared`, `lib`, `stores`, `hooks`, `providers`) → `components/ui`. Uma feature não importa outra feature. `components/ui` não importa feature.

## Árvore

```text
src/
  main.tsx                 entrada: tema, Query e Router
  routeTree.gen.ts         gerado pelo plugin; versionado; não editar
  index.css                Tailwind e tokens do shadcn
  routes/                  uma rota por arquivo
    __root.tsx             Outlet e Toaster (sem shell do painel ainda)
    index.tsx              /
    contents/
      index.tsx            /contents
      new.tsx              /contents/new
      $contentId.tsx       /contents/$contentId
  features/
    content/               domínio de conteúdo
      components/          telas e peças do domínio (vazio nesta etapa)
  components/
    ui/                    shadcn; só via CLI
    layout/                shell do painel (vazio; sem layout ainda)
    shared/                compostos reutilizáveis (vazio)
  lib/
    utils.ts               reexporta cn()
  stores/                  Zustand global de UI (vazio)
  providers/               providers extraídos do root (vazio; hoje estão em main.tsx)
  hooks/                   hooks sem domínio, alias @/hooks (vazio)
  assets/                  imagens importadas pelo código (vazio)
```

Pastas sem arquivo de código levam `.gitkeep` para o Git guardar o diretório.

## O que cada pasta faz

| Pasta                | Papel                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `routes/`            | `createFileRoute`, search params e loader. Compõe a tela. Sem regra de negócio e sem JSX longo.               |
| `features/content/`  | Tudo que sabe o que é um conteúdo: schema Zod, queries, colunas, componentes, mock. Ainda sem esses arquivos. |
| `components/ui/`     | Design system copiado pelo shadcn.                                                                            |
| `components/layout/` | App shell, sidebar, header. Não implementar nesta etapa.                                                      |
| `components/shared/` | Peças sem domínio, como tabela genérica e troca de tema.                                                      |
| `lib/`               | Funções puras e singletons (`cn`, no futuro QueryClient e datas).                                             |
| `stores/`            | Estado de interface global. Dados de servidor ficam no TanStack Query.                                        |
| `providers/`         | Reservada para extrair tema e Query de `main.tsx`.                                                            |
| `hooks/`             | Hooks genéricos. O `components.json` aponta `@/hooks` para cá.                                                |

## Convenções

- Filtros, ordenação e página da listagem ficam nos search params da rota, não no Zustand.
- Tipos da entidade saem de `z.infer` em `features/content/schemas.ts` quando o modelo for fechado. Sem pasta `types/` global.
- `components/ui` só cresce com `npx shadcn add`.
- `src/routeTree.gen.ts` é gerado pelo `@tanstack/router-plugin` quando o Vite sobe ou faz build. Ele entra no Git porque `npm run build` roda `tsc -b` antes do Vite: sem o arquivo versionado, a checagem de tipos quebra num clone limpo. ESLint e Prettier ignoram esse arquivo. Não editar à mão; ao mudar rotas, deixar o plugin regenerar e commitar o resultado.

## Fora desta etapa

- Layout do painel (sidebar e área principal).
- Modelo do item de conteúdo (campos e status) e roteiro da demo do TCC.
- Autenticação e cliente do CMS-BACK.
- Testes automatizados.
