import {
  dimensionDoubleValue,
  type NShiftPluginDimension,
} from '@/domain/plugins/style/nshift-plugin-dimension'

export class NShiftPluginFrameError extends Error {
  readonly reason:
    | 'fixedWidthConflictsWithFlexibleConstraints'
    | 'fixedHeightConflictsWithFlexibleConstraints'
    | 'fillNotAllowedForMinWidth'
    | 'fillNotAllowedForMinHeight'
    | 'contradictoryWidthConstraints'
    | 'contradictoryHeightConstraints'

  constructor(reason: NShiftPluginFrameError['reason']) {
    super(reason)
    this.name = 'NShiftPluginFrameError'
    this.reason = reason
  }
}

export type NShiftPluginFrame = {
  readonly width: number | null
  readonly height: number | null
  readonly minWidth: number | null
  readonly maxWidth: number | null
  readonly minHeight: number | null
  readonly maxHeight: number | null
}

export function emptyPluginFrame(): NShiftPluginFrame {
  return {
    width: null,
    height: null,
    minWidth: null,
    maxWidth: null,
    minHeight: null,
    maxHeight: null,
  }
}

export function createPluginFrame(input: {
  width?: number | null
  height?: number | null
  minWidth?: NShiftPluginDimension | null
  maxWidth?: NShiftPluginDimension | null
  minHeight?: NShiftPluginDimension | null
  maxHeight?: NShiftPluginDimension | null
}): NShiftPluginFrame {
  const width = input.width ?? null
  const height = input.height ?? null
  const minWidth = input.minWidth ?? null
  const maxWidth = input.maxWidth ?? null
  const minHeight = input.minHeight ?? null
  const maxHeight = input.maxHeight ?? null

  if (width !== null && (minWidth !== null || maxWidth !== null)) {
    throw new NShiftPluginFrameError(
      'fixedWidthConflictsWithFlexibleConstraints',
    )
  }

  if (height !== null && (minHeight !== null || maxHeight !== null)) {
    throw new NShiftPluginFrameError(
      'fixedHeightConflictsWithFlexibleConstraints',
    )
  }

  if (minWidth?.type === 'fill') {
    throw new NShiftPluginFrameError('fillNotAllowedForMinWidth')
  }

  if (minHeight?.type === 'fill') {
    throw new NShiftPluginFrameError('fillNotAllowedForMinHeight')
  }

  if (
    minWidth?.type === 'value' &&
    maxWidth?.type === 'value' &&
    minWidth.value > maxWidth.value
  ) {
    throw new NShiftPluginFrameError('contradictoryWidthConstraints')
  }

  if (
    minHeight?.type === 'value' &&
    maxHeight?.type === 'value' &&
    minHeight.value > maxHeight.value
  ) {
    throw new NShiftPluginFrameError('contradictoryHeightConstraints')
  }

  return {
    width,
    height,
    minWidth: minWidth ? dimensionDoubleValue(minWidth) : null,
    maxWidth: maxWidth ? dimensionDoubleValue(maxWidth) : null,
    minHeight: minHeight ? dimensionDoubleValue(minHeight) : null,
    maxHeight: maxHeight ? dimensionDoubleValue(maxHeight) : null,
  }
}
