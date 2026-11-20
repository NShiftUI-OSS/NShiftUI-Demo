import NShiftUI

@NShiftMetadata
struct ChangeEventEventMetadata: NShiftMetadata, Decodable {
    let eventID: String
}

@NShiftEvent(
    name: "ChangeEventEvent",
    version: "1.0.0",
    metadata: ChangeEventEventMetadata.self
)
struct ChangeEventEvent: NShiftEvent {
    func execute() async throws {
        let eventID = metadata.eventID
        guard let replacement = events.compactMap(\.event).first(where: {
            isOutcomeTrigger($0.trigger) == false
        }) else {
            return
        }
        let current = engine
        let nested = events
        let handler = eventHandler
        await MainActor.run {
            current?.replaceEvent(
                eventID: eventID,
                with: replacement
            )
        }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}
