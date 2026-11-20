import {
  createMetadata,
  nshiftMetadataKind,
  type NShiftMetadata,
} from '@/domain/metadata/nshift-metadata'

export type PreviewMetadata<Kind extends string> = NShiftMetadata & {
  readonly [nshiftMetadataKind]: Kind
}

export function definePreviewMetadata<Kind extends string>(kind: Kind) {
  return {
    kind,
    create(): PreviewMetadata<Kind> {
      return createMetadata(kind, {}) as PreviewMetadata<Kind>
    },
  }
}
