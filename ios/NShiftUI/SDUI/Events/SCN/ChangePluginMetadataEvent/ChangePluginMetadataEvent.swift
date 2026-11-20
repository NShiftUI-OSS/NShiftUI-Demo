import NShiftUI

@NShiftMetadata
struct ChangePluginMetadataEventMetadata: NShiftMetadata, Decodable {
    let pluginID: String
}

@NShiftSlotKey
enum ChangePluginMetadataEventSlot: NShiftSlotKey {
    case metadata
}

@NShiftEvent(
    name: "ChangePluginMetadataEvent",
    version: "1.0.0",
    metadata: ChangePluginMetadataEventMetadata.self,
    slots: ChangePluginMetadataEventSlot.self
)
struct ChangePluginMetadataEvent: NShiftEvent {
    func execute() async throws {
        let pluginID = metadata.pluginID
        guard let source = slotModels(.metadata).first else {
            return
        }
        let current = engine
        let nested = events
        let handler = eventHandler
        let applied = await MainActor.run { () -> Bool in
            guard let tree = current as? any NShiftEngineTree,
                  let node = tree.node(withID: pluginID),
                  node.model.name == source.name else {
                return false
            }
            current?.replaceMetadata(
                pluginID: pluginID,
                with: source.metadata
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
