const eventNamePattern = /^[A-Z][A-Za-z]*$/

export class NShiftEventNameError extends Error {
  readonly rawValue: string

  constructor(rawValue: string) {
    super(`Invalid NShift event name: ${rawValue}`)
    this.name = 'NShiftEventNameError'
    this.rawValue = rawValue
  }
}

export class NShiftEventName {
  readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  static validating(rawValue: string) {
    if (!eventNamePattern.test(rawValue)) {
      throw new NShiftEventNameError(rawValue)
    }

    return new NShiftEventName(rawValue)
  }

  toString() {
    return this.rawValue
  }
}
