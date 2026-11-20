export function isRainbowTrigger(name: string) {
  return /^On[A-Z][A-Za-z]*$/.test(name)
}

export const BOTTOM_SHEET_SLOT = 'BottomSheet'
export const SHEET_PLUGIN = 'Sheet'

export function isBottomSheetSlot(name: string) {
  return name === BOTTOM_SHEET_SLOT
}
