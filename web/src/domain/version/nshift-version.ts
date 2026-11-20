const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export class NShiftVersionError extends Error {
  readonly rawValue: string

  constructor(rawValue: string) {
    super(`Invalid NShift version: ${rawValue}`)
    this.name = 'NShiftVersionError'
    this.rawValue = rawValue
  }
}

export class NShiftVersion {
  readonly major: number
  readonly minor: number
  readonly patch: number

  private constructor(major: number, minor: number, patch: number) {
    this.major = major
    this.minor = minor
    this.patch = patch
  }

  get rawValue() {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  static validating(rawValue: string) {
    const match = versionPattern.exec(rawValue)
    if (!match) throw new NShiftVersionError(rawValue)

    return new NShiftVersion(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    )
  }

  static registrationName(name: string, version: NShiftVersion) {
    return `${name}@${version.rawValue}`
  }

  compare(other: NShiftVersion) {
    if (this.major !== other.major) return this.major - other.major
    if (this.minor !== other.minor) return this.minor - other.minor
    return this.patch - other.patch
  }
}
