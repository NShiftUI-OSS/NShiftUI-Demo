import NShiftUI
import SwiftUI

@NShiftMetadata
struct SearchBarMetadata: NShiftMetadata, Decodable {
    let placeholder: String
    let text: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        placeholder = try container.decodeIfPresent(String.self, forKey: .placeholder) ?? "Buscar"
        text = try container.decodeIfPresent(String.self, forKey: .text) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case placeholder, text
    }
}

/// `SearchBar(placeholder:)`: its text is a screen input (by its `.id`), so
/// templates (`{{input.id}}`) and `ForEach(searchInput:)` can read it.
/// Fires `OnChange` while typing and `OnSubmit` on search or clear.
@NShiftPlugin(
    name: "SearchBar",
    version: "1.0.0",
    metadata: SearchBarMetadata.self
)
struct SearchBarPlugin: NShiftPlugin {
    @State private var text: String?

    var body: some View {
        let screen = optionalViewModel(as: ScreenViewModel.self)
        // Starts from the screen input when it exists, so a retained screen
        // (tab switch, back navigation) keeps the current search.
        let stored = screen?.inputs.first { $0.id == inputID }?.value
        let current = text ?? stored ?? metadata.text
        let binding = Binding<String>(
            get: { current },
            set: { newValue in
                text = newValue
                screen?.registerInput(engine: engine, renderID: renderID, value: newValue)
                fire(.onChange, engine: engine, renderID: renderID)
            }
        )
        SCNSearchBar(text: binding, placeholder: metadata.placeholder) {
            fire(.onSubmit, engine: engine, renderID: renderID)
        }
        .onAppear {
            screen?.registerInput(engine: engine, renderID: renderID, value: current)
        }
    }

    private var inputID: String {
        if let tree = engine as? any NShiftEngineTree,
           let id = tree.node(withRenderID: renderID)?.model.id {
            return id
        }
        return renderID.rawValue
    }
}
