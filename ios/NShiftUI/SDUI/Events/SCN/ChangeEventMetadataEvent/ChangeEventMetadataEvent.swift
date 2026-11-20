import NShiftUI

@NShiftMetadata
struct ChangeEventMetadataEventMetadata: NShiftMetadata, Decodable {
    let eventID: String
}

@NShiftEvent(
    name: "ChangeEventMetadataEvent",
    version: "1.0.0",
    metadata: ChangeEventMetadataEventMetadata.self
)
struct ChangeEventMetadataEvent: NShiftEvent {
    func execute() async throws {
        let eventID = metadata.eventID
        guard let source = events.compactMap(\.event).first(where: {
            isOutcomeTrigger($0.trigger) == false
        }) else {
            return
        }
        let current = engine
        let nested = events
        let handler = eventHandler
        let applied = await MainActor.run { () -> Bool in
            guard let tree = current as? any NShiftEngineTree,
                  let existing = findEvent(
                    id: eventID,
                    in: tree.root
                  ),
                  existing.name == source.name else {
                return false
            }
            current?.replaceEvent(
                eventID: eventID,
                with: NShiftEventModel(
                    id: existing.id,
                    name: existing.name,
                    version: existing.version,
                    metadata: source.metadata,
                    trigger: existing.trigger,
                    slots: existing.slots,
                    events: existing.events
                )
            )
            return true
        }
        guard applied else { return }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}
