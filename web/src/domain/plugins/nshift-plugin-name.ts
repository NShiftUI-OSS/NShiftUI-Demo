const pluginNamePattern = /^[A-Z][A-Za-z]*$/

export class NShiftPluginNameError extends Error {
  readonly rawValue: string

  constructor(rawValue: string) {
    super(`Invalid NShift plugin name: ${rawValue}`)
    this.name = 'NShiftPluginNameError'
    this.rawValue = rawValue
  }
}

export class NShiftPluginName {
  readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  static validating(rawValue: string) {
    if (!pluginNamePattern.test(rawValue)) {
      throw new NShiftPluginNameError(rawValue)
    }

    return new NShiftPluginName(rawValue)
  }

  toString() {
    return this.rawValue
  }
}
