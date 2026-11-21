import { createEventModel } from '@/domain/events/nshift-event-model'
import { NShiftEventName } from '@/domain/events/nshift-event-name'
import { createMetadata, metadataKind } from '@/domain/metadata/nshift-metadata'
import { createPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { NShiftPluginStyle } from '@/domain/plugins/style/nshift-plugin-style'
import { NShiftPluginName } from '@/domain/plugins/nshift-plugin-name'
import { alertMetadata } from '@/domain/plugins/previews/alert-metadata'
import { attachmentMetadata } from '@/domain/plugins/previews/attachment-metadata'
import { avatarMetadata } from '@/domain/plugins/previews/avatar-metadata'
import { badgeMetadata } from '@/domain/plugins/previews/badge-metadata'
import { buttonGroupMetadata } from '@/domain/plugins/previews/button-group-metadata'
import { buttonMetadata } from '@/domain/plugins/previews/button-metadata'
import { calendarMetadata } from '@/domain/plugins/previews/calendar-metadata'
import { cardMetadata } from '@/domain/plugins/previews/card-metadata'
import { checkboxMetadata } from '@/domain/plugins/previews/checkbox-metadata'
import { containerMetadata } from '@/domain/plugins/previews/container-metadata'
import { fieldMetadata } from '@/domain/plugins/previews/field-metadata'
import { horizontalListMetadata } from '@/domain/plugins/previews/horizontal-list-metadata'
import { horizontalScrollMetadata } from '@/domain/plugins/previews/horizontal-scroll-metadata'
import { horizontalStackMetadata } from '@/domain/plugins/previews/horizontal-stack-metadata'
import { imageMetadata } from '@/domain/plugins/previews/image-metadata'
import { inputMetadata } from '@/domain/plugins/previews/input-metadata'
import { inputOtpMetadata } from '@/domain/plugins/previews/input-otp-metadata'
import { itemMetadata } from '@/domain/plugins/previews/item-metadata'
import { layerStackMetadata } from '@/domain/plugins/previews/layer-stack-metadata'
import { progressMetadata } from '@/domain/plugins/previews/progress-metadata'
import { radioMetadata } from '@/domain/plugins/previews/radio-metadata'
import { selectMetadata } from '@/domain/plugins/previews/select-metadata'
import { separatorMetadata } from '@/domain/plugins/previews/separator-metadata'
import { skeletonMetadata } from '@/domain/plugins/previews/skeleton-metadata'
import { sliderMetadata } from '@/domain/plugins/previews/slider-metadata'
import { spinnerMetadata } from '@/domain/plugins/previews/spinner-metadata'
import { switchMetadata } from '@/domain/plugins/previews/switch-metadata'
import { tabBarMetadata, tabMetadata } from '@/domain/plugins/previews/tab-bar-metadata'
import { tabsMetadata } from '@/domain/plugins/previews/tabs-metadata'
import { textMetadata } from '@/domain/plugins/previews/text-metadata'
import { textareaMetadata } from '@/domain/plugins/previews/textarea-metadata'
import { toggleGroupMetadata } from '@/domain/plugins/previews/toggle-group-metadata'
import { verticalListMetadata } from '@/domain/plugins/previews/vertical-list-metadata'
import { verticalScrollMetadata } from '@/domain/plugins/previews/vertical-scroll-metadata'
import { verticalStackMetadata } from '@/domain/plugins/previews/vertical-stack-metadata'
import { NShiftTrigger } from '@/domain/triggers/nshift-trigger'
import { NShiftVersion } from '@/domain/version/nshift-version'
import type { NShiftEventModel } from '@/domain/events/nshift-event-model'
import type { NShiftPluginModel } from '@/domain/plugins/nshift-plugin-model'
import type { PluginMetadataValue } from '@/scn/plugin-fields'

const previewPlugins = [
  { previewId: 'text', metadata: textMetadata },
  { previewId: 'image', metadata: imageMetadata },
  { previewId: 'button', metadata: buttonMetadata },
  { previewId: 'button-group', metadata: buttonGroupMetadata },
  { previewId: 'badge', metadata: badgeMetadata },
  { previewId: 'card', metadata: cardMetadata },
  { previewId: 'input', metadata: inputMetadata },
  { previewId: 'textarea', metadata: textareaMetadata },
  { previewId: 'input-otp', metadata: inputOtpMetadata },
  { previewId: 'field', metadata: fieldMetadata },
  { previewId: 'select', metadata: selectMetadata },
  { previewId: 'checkbox', metadata: checkboxMetadata },
  { previewId: 'radio', metadata: radioMetadata },
  { previewId: 'switch', metadata: switchMetadata },
  { previewId: 'toggle-group', metadata: toggleGroupMetadata },
  { previewId: 'slider', metadata: sliderMetadata },
  { previewId: 'tabs', metadata: tabsMetadata },
  { previewId: 'tab-bar', metadata: tabBarMetadata },
  { previewId: 'tab', metadata: tabMetadata },
  { previewId: 'alert', metadata: alertMetadata },
  { previewId: 'avatar', metadata: avatarMetadata },
  { previewId: 'calendar', metadata: calendarMetadata },
  { previewId: 'item', metadata: itemMetadata },
  { previewId: 'attachment', metadata: attachmentMetadata },
  { previewId: 'progress', metadata: progressMetadata },
  { previewId: 'separator', metadata: separatorMetadata },
  { previewId: 'skeleton', metadata: skeletonMetadata },
  { previewId: 'spinner', metadata: spinnerMetadata },
  { previewId: 'container', metadata: containerMetadata },
  { previewId: 'vertical-stack', metadata: verticalStackMetadata },
  { previewId: 'horizontal-stack', metadata: horizontalStackMetadata },
  { previewId: 'layer-stack', metadata: layerStackMetadata },
  { previewId: 'vertical-scroll', metadata: verticalScrollMetadata },
  { previewId: 'horizontal-scroll', metadata: horizontalScrollMetadata },
  { previewId: 'vertical-list', metadata: verticalListMetadata },
  { previewId: 'horizontal-list', metadata: horizontalListMetadata },
] as const

export type PreviewPluginId = (typeof previewPlugins)[number]['previewId']

export function previewPluginName(previewId: string) {
  return (
    previewPlugins.find((item) => item.previewId === previewId)?.metadata
      .kind ?? 'Plugin'
  )
}

export function createPreviewPlugin(input: {
  previewId: PreviewPluginId
  name: string
  version: string
  id?: string | null
  metadata?: Record<string, PluginMetadataValue>
  style?: NShiftPluginStyle
}) {
  const preview = previewPlugins.find(
    (item) => item.previewId === input.previewId,
  )
  if (!preview) {
    throw new Error(`Preview plugin is not registered: ${input.previewId}`)
  }

  return createPluginModel({
    id: input.id,
    name: NShiftPluginName.validating(input.name),
    version: NShiftVersion.validating(input.version),
    metadata: createMetadata(preview.metadata.kind, input.metadata ?? {}),
    style: input.style,
  })
}

export function resolvePreviewPlugin(model: NShiftPluginModel) {
  const kind = model.metadata ? metadataKind(model.metadata.base) : null
  const preview = previewPlugins.find((item) => item.metadata.kind === kind)
  if (!preview) return null

  return {
    previewId: preview.previewId,
    registrationName: `${model.name.rawValue}@${model.version.rawValue}`,
  }
}

export function createDomainEvent(input: {
  name: string
  version: string
  trigger: string
  id?: string
}) {
  const name = NShiftEventName.validating(input.name)
  return createEventModel({
    id: input.id,
    name,
    version: NShiftVersion.validating(input.version),
    trigger: NShiftTrigger.validating(input.trigger),
    metadata: createMetadata(name.rawValue, {}),
  })
}

export function resolveDomainEvent(model: NShiftEventModel) {
  const kind = model.metadata ? metadataKind(model.metadata.base) : null
  if (kind !== model.name.rawValue) return null

  return {
    registrationName: `${model.name.rawValue}@${model.version.rawValue}`,
  }
}

export function createDomainPlugin(input: {
  name: string
  version: string
  id?: string | null
}) {
  const name = NShiftPluginName.validating(input.name)
  return createPluginModel({
    id: input.id,
    name,
    version: NShiftVersion.validating(input.version),
    metadata: createMetadata(name.rawValue, {}),
  })
}
