import NShiftUI
import SwiftUI

@NShiftMetadata
struct CardMetadata: NShiftMetadata, Decodable {
    let filter: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        filter = try container.decodeIfPresent(String.self, forKey: .filter) ?? ""
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
        metadata.filter.isEmpty ||
            selection.caseInsensitiveCompare("Todos") == .orderedSame ||
            metadata.filter.caseInsensitiveCompare(selection) == .orderedSame
    }
}
