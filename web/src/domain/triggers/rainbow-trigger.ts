export function isRainbowTrigger(name: string) {
  return /^On[A-Z][A-Za-z]*$/.test(name)
}

export const BOTTOM_SHEET_SLOT = 'BottomSheet'
export const SHEET_PLUGIN = 'Sheet'
export const TAB_BAR_SLOT = 'TabBar'
export const TAB_BAR_PLUGIN = 'TabBar'
export const TAB_PLUGIN = 'Tab'

export function isBottomSheetSlot(name: string) {
  return name === BOTTOM_SHEET_SLOT
}

export function isTabBarSlot(name: string) {
  return name === TAB_BAR_SLOT
}

export function isTabPlugin(name: string) {
  return name === TAB_PLUGIN
}
