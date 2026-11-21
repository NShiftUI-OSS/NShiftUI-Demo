import NShiftUI

@NShiftMetadata
struct ChangeDSThemeMetadata: NShiftMetadata, Decodable {
    let theme: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        theme = try container.decodeIfPresent(String.self, forKey: .theme) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case theme
    }
}

@NShiftEvent(
    name: "ChangeDSTheme",
    version: "1.0.0",
    metadata: ChangeDSThemeMetadata.self
)
struct ChangeDSTheme: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let applied = await MainActor.run { () -> Bool in
            let raw = chosenTheme()
            guard let id = SCNThemeID.resolve(raw) else { return false }
            SCNTheme.shared.applyGlobal(id)
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

    @MainActor
    private func chosenTheme() -> String {
        if SCNThemeID.resolve(metadata.theme) != nil {
            return metadata.theme
        }
        if let selection = selectSelection() {
            return selection
        }
        let inputs = (viewModel as? ScreenViewModel)?.inputs.map(\.value) ?? []
        return inputs.reversed().first { SCNThemeID.resolve($0) != nil } ?? metadata.theme
    }

    @MainActor
    private func selectSelection() -> String? {
        guard let tree = engine as? any NShiftEngineTree else { return nil }
        return Self.themeSelection(in: tree.root)
    }

    @MainActor
    private static func themeSelection(in node: NShiftPluginNode) -> String? {
        if node.model.name.rawValue == "Select",
           let metadata = node.model.metadata?.unwrap(as: SelectMetadata.self),
           SCNThemeID.resolve(metadata.selection) != nil {
            return metadata.selection
        }
        for child in node.children {
            if let found = themeSelection(in: child) { return found }
        }
        for children in node.slotChildren.values {
            for child in children {
                if let found = themeSelection(in: child) { return found }
            }
        }
        return nil
    }
}
