import {
  createDomainEvent,
  createDomainPlugin,
  createPreviewPlugin,
  resolveDomainEvent,
  resolvePreviewPlugin,
  type PreviewPluginId,
} from '@/di/registrations'
import {
  formatRainbow,
  loadRainbowParser,
  parseRainbow,
  rainbowParserVersion,
  validateRainbow,
} from '@/di/rainbow-parser'
import type { NShiftEventModel } from '@/domain/events/nshift-event-model'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { NShiftPluginStyle } from '@/domain/plugins/style/nshift-plugin-style'
import type { PluginMetadataValue } from '@/scn/plugin-fields'

export type NShiftContainer = {
  parser: {
    ready: () => Promise<void>
    parse: (source: string) => Promise<unknown>
    format: (source: string) => Promise<{
      ok: boolean
      formatted: string | null
      diagnostics: { message: string }[]
    }>
    validate: (source: string, concrete?: boolean) => Promise<unknown>
    version: () => Promise<string>
  }
  plugins: {
    create: (input: {
      name: string
      version: string
      id?: string | null
    }) => NShiftPluginModel
    createPreview: (input: {
      previewId: PreviewPluginId
      name: string
      version: string
      id?: string | null
      metadata?: Record<string, PluginMetadataValue>
      style?: NShiftPluginStyle
    }) => NShiftPluginModel
    resolve: (
      model: NShiftPluginModel,
    ) => { previewId: PreviewPluginId; registrationName: string } | null
  }
  events: {
    create: (input: {
      name: string
      version: string
      trigger: string
      id?: string
    }) => NShiftEventModel
    resolve: (model: NShiftEventModel) => { registrationName: string } | null
  }
}

export function createNShiftContainer(): NShiftContainer {
  return {
    parser: {
      ready: loadRainbowParser,
      parse: parseRainbow,
      format: formatRainbow,
      validate: validateRainbow,
      version: rainbowParserVersion,
    },
    plugins: {
      create: createDomainPlugin,
      createPreview: createPreviewPlugin,
      resolve: resolvePreviewPlugin,
    },
    events: {
      create: createDomainEvent,
      resolve: resolveDomainEvent,
    },
  }
}
