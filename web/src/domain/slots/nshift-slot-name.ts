const slotNamePattern = /^[A-Z][A-Za-z]*$/

export class NShiftSlotNameError extends Error {
  readonly rawValue: string

  constructor(rawValue: string) {
    super(`Invalid NShift slot name: ${rawValue}`)
    this.name = 'NShiftSlotNameError'
    this.rawValue = rawValue
  }
}

export class NShiftSlotName {
  readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  static validating(rawValue: string) {
    if (!slotNamePattern.test(rawValue)) {
      throw new NShiftSlotNameError(rawValue)
    }

    return new NShiftSlotName(rawValue)
  }

  toString() {
    return this.rawValue
  }
}
