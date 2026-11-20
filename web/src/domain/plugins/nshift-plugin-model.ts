import { AnyNShiftPluginEvent } from '@/domain/events/any-nshift-plugin-event'
import type { NShiftEventModel } from '@/domain/events/nshift-event-model'
import { AnyNShiftMetadata } from '@/domain/metadata/any-nshift-metadata'
import type { NShiftMetadata } from '@/domain/metadata/nshift-metadata'
import { NShiftVersion } from '@/domain/version/nshift-version'
import type { NShiftPluginName } from '@/domain/plugins/nshift-plugin-name'
import {
  emptyPluginStyle,
  type NShiftPluginStyle,
} from '@/domain/plugins/style/nshift-plugin-style'

export type NShiftPluginModel = {
  readonly id: string | null
  readonly name: NShiftPluginName
  readonly version: NShiftVersion
  readonly metadata: AnyNShiftMetadata | null
  readonly style: NShiftPluginStyle
  readonly children: readonly NShiftPluginModel[]
  readonly slots: Readonly<Record<string, readonly NShiftPluginModel[]>>
  readonly events: readonly AnyNShiftPluginEvent[]
}

export function createPluginModel(input: {
  id?: string | null
  name: NShiftPluginName
  version: NShiftVersion
  metadata?: AnyNShiftMetadata | NShiftMetadata | null
  style?: NShiftPluginStyle
  children?: readonly NShiftPluginModel[]
  slots?: Readonly<Record<string, readonly NShiftPluginModel[]>>
  events?: readonly NShiftEventModel[]
}): NShiftPluginModel {
  return {
    id: input.id ?? null,
    name: input.name,
    version: input.version,
    metadata: wrapMetadata(input.metadata),
    style: input.style ?? emptyPluginStyle(),
    children: input.children ?? [],
    slots: input.slots ?? {},
    events: (input.events ?? []).map((event) =>
      AnyNShiftPluginEvent.wrap(event),
    ),
  }
}

export function pluginRegistrationName(plugin: NShiftPluginModel) {
  return NShiftVersion.registrationName(plugin.name.rawValue, plugin.version)
}

function wrapMetadata(metadata?: AnyNShiftMetadata | NShiftMetadata | null) {
  if (!metadata) return null
  if (metadata instanceof AnyNShiftMetadata) return metadata
  return AnyNShiftMetadata.wrap(metadata)
}
