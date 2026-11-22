import NShiftUI

@NShiftMetadata
struct ChangeTabEventMetadata: NShiftMetadata, Decodable {
    let index: Int

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        index = try container.decodeIfPresent(Int.self, forKey: .index) ?? 0
    }

    private enum CodingKeys: String, CodingKey {
        case index
    }
}

/// `ChangeTabEvent(index:)`: selects a tab of the screen's TabBar instead of
/// pushing another screen (0 is the first tab).
@NShiftEvent(
    name: "ChangeTabEvent",
    version: "1.0.0",
    metadata: ChangeTabEventMetadata.self
)
struct ChangeTabEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let index = metadata.index
        let changed = await Self.select(index, engine: engine, fallback: viewModel)
        guard changed else { return }
        await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
    }

    @MainActor
    private static func select(
        _ index: Int,
        engine: (any NShiftEngine)?,
        fallback: (any NShiftPluginViewModel)?
    ) -> Bool {
        guard index >= 0,
              let screen = ScreenViewModel.resolve(engine: engine, fallback: fallback) else {
            return false
        }
        screen.selectedTab = index
        return true
    }
}
