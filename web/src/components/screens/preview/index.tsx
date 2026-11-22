import { alertPreview } from '@/components/screens/preview/alert-preview'
import { attachmentPreview } from '@/components/screens/preview/attachment-preview'
import { avatarPreview } from '@/components/screens/preview/avatar-preview'
import { badgePreview } from '@/components/screens/preview/badge-preview'
import { buttonGroupPreview } from '@/components/screens/preview/button-group-preview'
import { buttonPreview } from '@/components/screens/preview/button-preview'
import { calendarPreview } from '@/components/screens/preview/calendar-preview'
import { cardPreview } from '@/components/screens/preview/card-preview'
import { checkboxPreview } from '@/components/screens/preview/checkbox-preview'
import { containerPreview } from '@/components/screens/preview/container-preview'
import { fieldPreview } from '@/components/screens/preview/field-preview'
import { horizontalListPreview } from '@/components/screens/preview/horizontal-list-preview'
import { horizontalScrollPreview } from '@/components/screens/preview/horizontal-scroll-preview'
import { horizontalStackPreview } from '@/components/screens/preview/horizontal-stack-preview'
import { imagePreview } from '@/components/screens/preview/image-preview'
import { inputOtpPreview } from '@/components/screens/preview/input-otp-preview'
import { inputPreview } from '@/components/screens/preview/input-preview'
import { itemPreview } from '@/components/screens/preview/item-preview'
import { layerStackPreview } from '@/components/screens/preview/layer-stack-preview'
import { progressPreview } from '@/components/screens/preview/progress-preview'
import { radioPreview } from '@/components/screens/preview/radio-preview'
import { selectPreview } from '@/components/screens/preview/select-preview'
import { separatorPreview } from '@/components/screens/preview/separator-preview'
import { skeletonPreview } from '@/components/screens/preview/skeleton-preview'
import { sliderPreview } from '@/components/screens/preview/slider-preview'
import { spinnerPreview } from '@/components/screens/preview/spinner-preview'
import { switchPreview } from '@/components/screens/preview/switch-preview'
import { tabBarPreview, tabPreview } from '@/components/screens/preview/tab-bar-preview'
import { tabsPreview } from '@/components/screens/preview/tabs-preview'
import { textPreview } from '@/components/screens/preview/text-preview'
import { textareaPreview } from '@/components/screens/preview/textarea-preview'
import { toggleGroupPreview } from '@/components/screens/preview/toggle-group-preview'
import { verticalListPreview } from '@/components/screens/preview/vertical-list-preview'
import { verticalScrollPreview } from '@/components/screens/preview/vertical-scroll-preview'
import { verticalStackPreview } from '@/components/screens/preview/vertical-stack-preview'
import { forEachPreview } from '@/components/screens/preview/for-each-preview'
import { searchBarPreview } from '@/components/screens/preview/search-bar-preview'
import { floatingButtonPreview } from '@/components/screens/preview/floating-button-preview'
import type {
  PreviewRenderProps,
  ScreenComponentDefinition,
} from '@/components/screens/preview/types'
import { PluginChrome } from '@/components/screens/preview/plugin-chrome'
import { ScnRoot } from '@/scn/theme'

export type {
  PreviewModule,
  PreviewRenderProps,
  ScreenComponentDefinition,
} from '@/components/screens/preview/types'

const previewCatalog = [
  textPreview,
  imagePreview,
  buttonPreview,
  buttonGroupPreview,
  badgePreview,
  cardPreview,
  inputPreview,
  searchBarPreview,
  floatingButtonPreview,
  textareaPreview,
  inputOtpPreview,
  fieldPreview,
  selectPreview,
  checkboxPreview,
  radioPreview,
  switchPreview,
  toggleGroupPreview,
  sliderPreview,
  tabsPreview,
  tabBarPreview,
  tabPreview,
  alertPreview,
  avatarPreview,
  calendarPreview,
  itemPreview,
  attachmentPreview,
  progressPreview,
  separatorPreview,
  skeletonPreview,
  spinnerPreview,
  containerPreview,
  verticalStackPreview,
  forEachPreview,
  horizontalStackPreview,
  layerStackPreview,
  verticalScrollPreview,
  horizontalScrollPreview,
  verticalListPreview,
  horizontalListPreview,
]

export const screenComponents: ScreenComponentDefinition[] = previewCatalog.map(
  (preview) => preview.definition,
)

export function getScreenComponent(id: string) {
  return screenComponents.find((component) => component.id === id)
}

export function renderPreview(id: string, props: PreviewRenderProps) {
  const preview = previewCatalog.find((item) => item.definition.id === id)
  if (!preview) return null

  const Preview = preview.Preview
  return (
    <ScnRoot>
      <PluginChrome componentId={id} values={props.values}>
        <Preview {...props} />
      </PluginChrome>
    </ScnRoot>
  )
}
