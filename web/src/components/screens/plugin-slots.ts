import type { PluginField } from '@/scn/plugin-fields'

export type PluginSlot = {
  id: string
  name: string
  description: string
}

const slotsByPlugin: Record<string, PluginSlot[]> = {
  'search-bar': [
    {
      id: 'badges',
      name: 'Badges',
      description: 'Badges abaixo da busca; com scroll horizontal quando não cabem.',
    },
  ],
  'nshift-screen': [
    {
      id: 'bottomSheet',
      name: 'Bottom sheet',
      description: 'Conteúdo apresentado por cima desta tela.',
    },
    {
      id: 'tabBar',
      name: 'Tab bar',
      description: 'Barra fixa no rodapé. As abas vivem neste slot, fora do conteúdo.',
    },
    {
      id: 'searchBar',
      name: 'Search bar',
      description: 'Busca flutuante no topo; o conteúdo rola por baixo dela.',
    },
  ],
}

export function slotsForPlugin(componentId: string) {
  return slotsByPlugin[componentId] ?? []
}

export const sheetFields: PluginField[] = [
  {
    name: 'title',
    label: 'Título',
    kind: 'text',
    defaultValue: 'Bottom sheet',
    required: true,
  },
]

export const screenFields: PluginField[] = [
  {
    name: 'navigationBar.title',
    label: 'Título',
    kind: 'text',
    defaultValue: '',
  },
  {
    name: 'navigationBar.leading',
    label: 'Botão à esquerda',
    kind: 'select',
    options: ['auto', 'none', 'back', 'button'],
    defaultValue: 'auto',
  },
  {
    name: 'navigationBar.leadingIcon',
    label: 'Ícone à esquerda',
    kind: 'icon',
    defaultValue: '',
  },
  {
    name: 'navigationBar.trailing',
    label: 'Botão à direita',
    kind: 'select',
    options: ['none', 'close', 'button'],
    defaultValue: 'none',
  },
  {
    name: 'navigationBar.trailingIcon',
    label: 'Ícone à direita',
    kind: 'icon',
    defaultValue: '',
  },
  {
    name: 'navigationBar.centerIcon',
    label: 'Ícone central',
    kind: 'icon',
    defaultValue: '',
  },
  {
    name: 'navigationBar.background',
    label: 'Fundo da barra',
    kind: 'select',
    options: ['background', 'card', 'primary', 'muted', 'secondary'],
    defaultValue: 'background',
  },
  {
    name: 'scroll.enabled',
    label: 'Scroll habilitado',
    kind: 'boolean',
    defaultValue: 'false',
  },
  {
    name: 'scroll.isLazy',
    label: 'Scroll lazy',
    kind: 'boolean',
    defaultValue: 'false',
  },
  {
    name: 'scroll.fastRefresh',
    label: 'Fast refresh',
    kind: 'boolean',
    defaultValue: 'true',
  },
]
