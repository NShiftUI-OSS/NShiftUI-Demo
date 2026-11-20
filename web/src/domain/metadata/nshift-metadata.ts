export const nshiftMetadataKind = Symbol('nshiftMetadataKind')

export type NShiftMetadata = {
  readonly [nshiftMetadataKind]: string
}

export function createMetadata<T extends object>(
  kind: string,
  value: T,
): T & NShiftMetadata {
  return {
    ...value,
    [nshiftMetadataKind]: kind,
  }
}

export function metadataKind(metadata: NShiftMetadata) {
  return metadata[nshiftMetadataKind]
}
