import { AnyNShiftMetadata } from '@/domain/metadata/any-nshift-metadata'
import type { NShiftMetadata } from '@/domain/metadata/nshift-metadata'
import { NShiftVersion } from '@/domain/version/nshift-version'
import type { NShiftEventName } from '@/domain/events/nshift-event-name'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { NShiftSlotName } from '@/domain/slots/nshift-slot-name'
import type { NShiftTrigger } from '@/domain/triggers/nshift-trigger'

export type NShiftEventModel = {
  readonly id: string
  readonly name: NShiftEventName
  readonly version: NShiftVersion
  readonly metadata: AnyNShiftMetadata | null
  readonly trigger: NShiftTrigger
  readonly slots: Readonly<Record<string, readonly NShiftPluginModel[]>>
  readonly events: readonly NShiftEventModel[]
}

export function createEventModel(input: {
  id?: string
  name: NShiftEventName
  version: NShiftVersion
  metadata?: AnyNShiftMetadata | NShiftMetadata | null
  trigger: NShiftTrigger
  slots?: Readonly<Record<string, readonly NShiftPluginModel[]>>
  events?: readonly NShiftEventModel[]
}): NShiftEventModel {
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    version: input.version,
    metadata: wrapMetadata(input.metadata),
    trigger: input.trigger,
    slots: input.slots ?? {},
    events: input.events ?? [],
  }
}

export function eventRegistrationName(event: NShiftEventModel) {
  return NShiftVersion.registrationName(event.name.rawValue, event.version)
}

export function slotKey(slot: NShiftSlotName) {
  return slot.rawValue
}

function wrapMetadata(metadata?: AnyNShiftMetadata | NShiftMetadata | null) {
  if (!metadata) return null
  if (metadata instanceof AnyNShiftMetadata) return metadata
  return AnyNShiftMetadata.wrap(metadata)
}
