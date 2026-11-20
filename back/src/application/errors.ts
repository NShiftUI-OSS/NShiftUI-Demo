export class NotFoundError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class InvalidRainbowError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidRainbowError'
  }
}
