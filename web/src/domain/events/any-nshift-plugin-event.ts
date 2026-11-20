import type { NShiftEventModel } from '@/domain/events/nshift-event-model'

export class AnyNShiftPluginEvent {
  readonly #event: NShiftEventModel

  private constructor(event: NShiftEventModel) {
    this.#event = event
  }

  static wrap(event: NShiftEventModel) {
    return new AnyNShiftPluginEvent(event)
  }

  get event(): NShiftEventModel {
    return this.#event
  }
}
