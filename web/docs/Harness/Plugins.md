# Plugins nativos

`src/domain/plugins/previews/` é o espaço reservado para representar plugins que existem na plataforma nativa. Um arquivo por plugin. O harness é `definePreviewMetadata('Text')`: o argumento é o nome nativo, o mesmo de `@NShiftPlugin(name:)` no iOS.

O desenho no telefone não mora nessa pasta. Cada bloco visual é um `PreviewModule` em `src/components/screens/preview/`. A lista que junta os dois lados é `previewPlugins` em `src/di/registrations.ts`.

Eventos têm o mesmo espaço, vazio, em `src/domain/events/previews/index.ts`.

## O que o telefone desenha hoje

Os plugins do `CatalogAssembly` têm preview no telefone, com o visual do sub design system `.scn`. Ficam de fora, de propósito, `Sheet` e `Screen`: bottom sheet e navigation bar ainda não têm lugar definido dentro do canvas.

O tema do telefone (Neutral, Stone, Blue e os demais presets do iOS) vive só em `.scn`. Trocar o preset não altera as cores do painel do CMS.

## Blocos que já existiam

| Nome nativo | previewId | Metadata | Preview |
| --- | --- | --- | --- |
| Text | text | `previews/text-metadata.ts` | `preview/text-preview.tsx` |
| Image | image | `previews/image-metadata.ts` | `preview/image-preview.tsx` |
| Button | button | `previews/button-metadata.ts` | `preview/button-preview.tsx` |
| Container | container | `previews/container-metadata.ts` | `preview/container-preview.tsx` |
| VerticalStack | vertical-stack | `previews/vertical-stack-metadata.ts` | `preview/vertical-stack-preview.tsx` |
| HorizontalStack | horizontal-stack | `previews/horizontal-stack-metadata.ts` | `preview/horizontal-stack-preview.tsx` |
| LayerStack | layer-stack | `previews/layer-stack-metadata.ts` | `preview/layer-stack-preview.tsx` |
| VerticalScroll | vertical-scroll | `previews/vertical-scroll-metadata.ts` | `preview/vertical-scroll-preview.tsx` |
| HorizontalScroll | horizontal-scroll | `previews/horizontal-scroll-metadata.ts` | `preview/horizontal-scroll-preview.tsx` |
| VerticalList | vertical-list | `previews/vertical-list-metadata.ts` | `preview/vertical-list-preview.tsx` |
| HorizontalList | horizontal-list | `previews/horizontal-list-metadata.ts` | `preview/horizontal-list-preview.tsx` |

O metadata no CMS ainda é `{}`. No iOS, `TextMetadata` já carrega `text`, `style`, `weight` e `color`. O preview mostra o componente nativo com conteúdo de exemplo. Não invente esses campos no Rainbow até o preview passar a lê-los.

`Button` e `Text` também estão no catálogo do app. As stacks, scrolls e lists primitivas são as do `CatalogAssembly`: `VerticalStack`, `HorizontalStack`, `LayerStack`, `VerticalScroll`, `HorizontalScroll`, `VerticalList` e `HorizontalList`. No preview elas ficam com a moldura pontilhada, porque não têm visual próprio. `Image` e `Container` continuam só no editor.

## Catálogo registrado no app

Fonte: `NShiftUI-iOS-POC/NShiftUI/DI/CatalogAssembly.swift`. O Android instala o catálogo gerado em `CatalogAssembly.assemblePlugins`. O preview desses nomes já está na sidebar, menos `Sheet` e `Screen`:

Alert, Attachment, Avatar, Badge, ButtonGroup, Calendar, Card, Checkbox, Field, HorizontalList, HorizontalScroll, HorizontalStack, Input, InputOTP, Item, LayerStack, Progress, Radio, Select, Separator, Skeleton, Slider, Spinner, Switch, Tabs, Textarea, ToggleGroup, VerticalList, VerticalScroll, VerticalStack.

Eventos do mesmo assembly, também sem preview:

ChangePluginMetadata, ChangeEventMetadata, ChangePlugin, ChangeEvent, SendHTTPRequest, OpenBottomSheet, CloseBottomSheet, Navigate.

Triggers já usados pelo app: `onTap`, `onChange`, `onSelect`, `onDismiss`, `onComplete`, `onPresent`, `onFailure`. O domínio do CMS aceita `on` seguido de palavras em CamelCase. `onStatusCode404` é outro formato e não passa nesse validador.

## Como acrescentar um preview

1. Criar `src/domain/plugins/previews/<nome>-metadata.ts` com `definePreviewMetadata('NomeNativo')` e exportar em `previews/index.ts`.
2. Criar `src/components/screens/preview/<nome>-preview.tsx` exportando um `PreviewModule`.
3. Incluir o módulo em `previewCatalog` (`preview/index.tsx`).
4. Incluir `{ previewId, metadata }` em `previewPlugins` (`src/di/registrations.ts`).
5. Mapear o nome Rainbow para o `previewId` em `previewIds` (`rainbow-source.ts`).

Cadastrar o plugin na tela de Plugins grava uma linha no Postgres. Isso não cria o preview nem escreve um nó Rainbow. Soltar o bloco no telefone escreve o nó no texto.
