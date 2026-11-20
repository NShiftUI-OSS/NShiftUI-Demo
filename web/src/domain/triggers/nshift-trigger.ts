const triggerPattern = /^on(?:[A-Z][a-z]*)+$/

export class NShiftTriggerError extends Error {
  readonly rawValue: string

  constructor(rawValue: string) {
    super(`Invalid NShift trigger: ${rawValue}`)
    this.name = 'NShiftTriggerError'
    this.rawValue = rawValue
  }
}

export class NShiftTrigger {
  readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  static validating(rawValue: string) {
    if (!triggerPattern.test(rawValue)) {
      throw new NShiftTriggerError(rawValue)
    }

    return new NShiftTrigger(rawValue)
  }

  toString() {
    return this.rawValue
  }
}
