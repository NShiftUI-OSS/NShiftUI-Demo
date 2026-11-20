import NShiftUI

@NShiftMetadata
struct ChangePluginEventMetadata: NShiftMetadata, Decodable {
    let pluginID: String
}

@NShiftSlotKey
enum ChangePluginEventSlot: NShiftSlotKey {
    case replacement
}

@NShiftEvent(
    name: "ChangePluginEvent",
    version: "1.0.0",
    metadata: ChangePluginEventMetadata.self,
    slots: ChangePluginEventSlot.self
)
struct ChangePluginEvent: NShiftEvent {
    func execute() async throws {
        let pluginID = metadata.pluginID
        guard let model = slotModels(.replacement).first else {
            return
        }
        let current = engine
        let nested = events
        let handler = eventHandler
        await MainActor.run {
            current?.replacePlugin(
                pluginID: pluginID,
                with: model
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
