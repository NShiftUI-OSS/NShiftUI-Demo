import { asyncNavigateEventMetadata } from '@/domain/events/previews/async-navigate-metadata'
import { changeDsThemeMetadata } from '@/domain/events/previews/change-ds-theme-metadata'
import { changeEventEventMetadata } from '@/domain/events/previews/change-event-metadata'
import { changeEventMetadataEventMetadata } from '@/domain/events/previews/change-event-metadata-metadata'
import { changePluginEventMetadata } from '@/domain/events/previews/change-plugin-metadata'
import { changePluginMetadataEventMetadata } from '@/domain/events/previews/change-plugin-metadata-metadata'
import { closeBottomSheetEventMetadata } from '@/domain/events/previews/close-bottom-sheet-metadata'
import { backNavigationEventMetadata } from '@/domain/events/previews/back-navigation-metadata'
import { navigateEventMetadata } from '@/domain/events/previews/navigate-metadata'
import { openBottomSheetEventMetadata } from '@/domain/events/previews/open-bottom-sheet-metadata'
import { sendHttpRequestEventMetadata } from '@/domain/events/previews/send-http-request-metadata'
import { updateListEventMetadata } from '@/domain/events/previews/update-list-metadata'
import { changeTabEventMetadata } from '@/domain/events/previews/change-tab-metadata'
import { closeAppEventMetadata } from '@/domain/events/previews/close-app-metadata'
import { addListItemEventMetadata } from '@/domain/events/previews/add-list-item-metadata'
import { clearListEventMetadata } from '@/domain/events/previews/clear-list-metadata'
import { showSuccessEventMetadata } from '@/domain/events/previews/show-success-metadata'
import { showToastEventMetadata } from '@/domain/events/previews/show-toast-metadata'
import type { PluginField } from '@/scn/plugin-fields'
import { scnPresets } from '@/scn/presets'

export type FlowEventDefinition = {
  id: string
  name: string
  description: string
  triggers: readonly string[]
  fields: PluginField[]
  metadata: { kind: string }
}

const text = (
  name: string,
  label: string,
  defaultValue = '',
  required = false,
): PluginField => ({
  name,
  label,
  kind: 'text',
  defaultValue,
  required,
})

const select = (
  name: string,
  label: string,
  options: string[],
  defaultValue = options[0] ?? '',
): PluginField => ({
  name,
  label,
  kind: 'select',
  options,
  defaultValue,
})

const number = (
  name: string,
  label: string,
  defaultValue = '',
): PluginField => ({
  name,
  label,
  kind: 'number',
  defaultValue,
})

const complete = ['OnComplete'] as const

export const flowEvents: FlowEventDefinition[] = [
  {
    id: 'navigate',
    name: navigateEventMetadata.kind,
    description: 'Abre uma tela na pilha',
    triggers: complete,
    metadata: navigateEventMetadata,
    fields: [
      text('screenName', 'Tela', '', true),
      select('presentation', 'Apresentação', ['push', 'modal']),
    ],
  },
  {
    id: 'change-ds-theme',
    name: changeDsThemeMetadata.kind,
    description: 'Troca o tema global do aplicativo',
    triggers: complete,
    metadata: changeDsThemeMetadata,
    fields: [
      select(
        'theme',
        'Tema',
        scnPresets.map((preset) => preset.id),
        'neutral',
      ),
    ],
  },
  {
    id: 'back-navigation',
    name: backNavigationEventMetadata.kind,
    description: 'Volta uma tela, várias, ou até uma rota',
    triggers: complete,
    metadata: backNavigationEventMetadata,
    fields: [
      number('for', 'Quantidade'),
      text('to', 'Rota ou root'),
    ],
  },
  {
    id: 'async-navigate',
    name: asyncNavigateEventMetadata.kind,
    description: 'Carrega a tela antes de apresentá-la',
    triggers: complete,
    metadata: asyncNavigateEventMetadata,
    fields: [text('screenName', 'Tela', '', true)],
  },
  {
    id: 'send-http-request',
    name: sendHttpRequestEventMetadata.kind,
    description: 'Chama o backend. O corpo é um documento @JSON',
    triggers: ['OnComplete', 'OnFailure'],
    metadata: sendHttpRequestEventMetadata,
    fields: [
      select('method', 'Método', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      text('path', 'Endpoint', '/', true),
      { ...text('body', 'Corpo'), embedded: 'JSON' },
    ],
  },
  {
    id: 'change-tab',
    name: changeTabEventMetadata.kind,
    description: 'Troca a aba selecionada da TabBar da tela (0 é a primeira)',
    triggers: complete,
    metadata: changeTabEventMetadata,
    fields: [number('index', 'Índice da aba', '0')],
  },
  {
    id: 'close-app',
    name: closeAppEventMetadata.kind,
    description: 'Fecha o aplicativo',
    triggers: [],
    metadata: closeAppEventMetadata,
    fields: [],
  },
  {
    id: 'add-list-item',
    name: addListItemEventMetadata.kind,
    description:
      'Adiciona um item a uma lista do app (compartilhada entre telas). O item é um objeto (chave: "valor") e aceita {{campo}} dentro de um ForEach',
    triggers: complete,
    metadata: addListItemEventMetadata,
    fields: [text('listID', 'Lista (id)', 'cart', true)],
  },
  {
    id: 'clear-list',
    name: clearListEventMetadata.kind,
    description: 'Remove todos os itens de uma lista do app',
    triggers: complete,
    metadata: clearListEventMetadata,
    fields: [text('listID', 'Lista (id)', 'cart', true)],
  },
  {
    id: 'show-success',
    name: showSuccessEventMetadata.kind,
    description: 'Mostra uma animação de sucesso; os próximos eventos rodam quando ela termina',
    triggers: complete,
    metadata: showSuccessEventMetadata,
    fields: [text('title', 'Título', 'Sucesso!'), text('message', 'Mensagem', '')],
  },
  {
    id: 'show-toast',
    name: showToastEventMetadata.kind,
    description: 'Mostra um toast no topo da tela sem bloquear os próximos eventos',
    triggers: complete,
    metadata: showToastEventMetadata,
    fields: [
      text('title', 'Título', 'Pronto!', true),
      text('message', 'Mensagem (aceita {{campo}} num ForEach)', ''),
      { name: 'icon', label: 'Ícone', kind: 'icon', defaultValue: 'circle-check' },
      select('variant', 'Variante', ['default', 'success', 'error', 'info', 'warning']),
      number('duration', 'Duração (s)', '2.5'),
    ],
  },
  {
    id: 'update-list',
    name: updateListEventMetadata.kind,
    description: 'Carrega JSON em uma lista por id; o ForEach dessa lista renderiza os itens',
    triggers: ['OnComplete', 'OnFailure'],
    metadata: updateListEventMetadata,
    fields: [
      text('listID', 'Lista (id)', '', true),
      text('url', 'URL (aceita {{route.x}} e {{input.x}})', '', true),
      text('itemsPath', 'Caminho dos itens no JSON', ''),
      select('mode', 'Modo', ['append', 'replace']),
      number('pageSize', 'Itens por página', '0'),
      text('offsetParameter', 'Parâmetro de offset', 'offset'),
      text('limitParameter', 'Parâmetro de limite', 'limit'),
      text('nextPath', 'Caminho da próxima página', ''),
      text('totalPath', 'Caminho do total', ''),
      text('expandPath', 'Campo com URL de detalhe', ''),
      number('maxPages', 'Páginas por disparo', '1'),
    ],
  },
  {
    id: 'open-bottom-sheet',
    name: openBottomSheetEventMetadata.kind,
    description: 'Abre um bottom sheet',
    triggers: complete,
    metadata: openBottomSheetEventMetadata,
    fields: [text('sheetID', 'Sheet', 'sheet', true)],
  },
  {
    id: 'close-bottom-sheet',
    name: closeBottomSheetEventMetadata.kind,
    description: 'Fecha um bottom sheet',
    triggers: complete,
    metadata: closeBottomSheetEventMetadata,
    fields: [text('sheetID', 'Sheet', 'sheet', true)],
  },
  {
    id: 'change-plugin',
    name: changePluginEventMetadata.kind,
    description: 'Troca um plugin por outro',
    triggers: complete,
    metadata: changePluginEventMetadata,
    fields: [text('pluginID', 'Plugin', 'plugin', true)],
  },
  {
    id: 'change-event',
    name: changeEventEventMetadata.kind,
    description: 'Troca um evento por outro',
    triggers: complete,
    metadata: changeEventEventMetadata,
    fields: [text('eventID', 'Evento', 'event', true)],
  },
  {
    id: 'change-plugin-metadata',
    name: changePluginMetadataEventMetadata.kind,
    description: 'Copia o metadata do plugin colocado no slot Metadata',
    triggers: complete,
    metadata: changePluginMetadataEventMetadata,
    fields: [text('pluginID', 'Plugin', 'plugin', true)],
  },
  {
    id: 'change-event-metadata',
    name: changeEventMetadataEventMetadata.kind,
    description: 'Copia o metadata do evento filho',
    triggers: complete,
    metadata: changeEventMetadataEventMetadata,
    fields: [text('eventID', 'Evento', 'event', true)],
  },
]

export function flowEventById(id: string) {
  return flowEvents.find((event) => event.id === id)
}

export function triggersForEvent(name: string) {
  return flowEvents.find((event) => event.name === name)?.triggers ?? complete
}
