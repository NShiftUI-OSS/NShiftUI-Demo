import {
  metadataKind,
  type NShiftMetadata,
} from '@/domain/metadata/nshift-metadata'

export class AnyNShiftMetadata {
  readonly #value: NShiftMetadata

  private constructor(value: NShiftMetadata) {
    this.#value = value
  }

  static wrap(metadata: NShiftMetadata) {
    return new AnyNShiftMetadata(metadata)
  }

  get base(): NShiftMetadata {
    return this.#value
  }

  unwrap<T extends NShiftMetadata>(kind: string): T | null {
    return metadataKind(this.#value) === kind ? (this.#value as T) : null
  }
}
