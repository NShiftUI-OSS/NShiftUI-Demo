export const nshiftPluginAlignments = [
  'topLeading',
  'top',
  'topTrailing',
  'leading',
  'center',
  'trailing',
  'bottomLeading',
  'bottom',
  'bottomTrailing',
] as const

export type NShiftPluginAlignment = (typeof nshiftPluginAlignments)[number]
