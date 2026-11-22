import NShiftUI
import SwiftUI

@NShiftMetadata
struct CardMetadata: NShiftMetadata, Decodable {
    let filter: String

    init(filter: String) {
        self.filter = filter
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        filter = try container.decodeIfPresent(String.self, forKey: .filter) ?? ""
    }

    static let filterInputID = "product-filter"

    static func selection(in inputs: [ScreenInput]) -> String {
        inputs.first { $0.id == filterInputID }?.value ?? "Todos"
    }

    func isVisible(for selection: String) -> Bool {
        filter.isEmpty ||
            selection.caseInsensitiveCompare("Todos") == .orderedSame ||
            filter.caseInsensitiveCompare(selection) == .orderedSame
    }

    static func isHidden(_ model: NShiftPluginModel, in inputs: [ScreenInput]) -> Bool {
        guard model.name.rawValue == "Card",
              let metadata = model.metadata?.unwrap(as: CardMetadata.self) else {
            return false
        }
        return metadata.isVisible(for: selection(in: inputs)) == false
    }

    private enum CodingKeys: String, CodingKey {
        case filter
    }
}

@NShiftPlugin(
    name: "Card",
    version: "1.0.0",
    metadata: CardMetadata.self
)
struct CardPlugin: NShiftPlugin {
    @State private var selectedFilter = "Todos"

    var body: some View {
        if let screen = optionalViewModel(as: ScreenViewModel.self) {
            let currentFilter = screen.inputs.first {
                $0.id == "product-filter"
            }?.value ?? selectedFilter
            card(isVisible: cardIsVisible(for: currentFilter))
                .onReceive(screen.$inputs) { inputs in
                    selectedFilter = inputs.first {
                        $0.id == "product-filter"
                    }?.value ?? "Todos"
                }
        } else {
            card(isVisible: true)
        }
    }

    @ViewBuilder
    private func card(isVisible: Bool) -> some View {
        if isVisible {
            SCNCard(action: {
                fire(
                    .onTap,
                    engine: engine,
                    renderID: renderID
                )
            }) {
                children()
            }
        }
    }

    private func cardIsVisible(for selection: String) -> Bool {
        metadata.isVisible(for: selection)
    }
}
