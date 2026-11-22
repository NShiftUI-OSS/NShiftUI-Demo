import NShiftUI
import SwiftUI

@NShiftMetadata
struct BadgeMetadata: NShiftMetadata, Decodable {
    let text: String
    let variant: String
    /// Optional selection: tapping writes `value` to the screen input
    /// `input`; while it holds `value` the badge shows `selectedVariant`.
    let input: String
    let value: String
    let selectedVariant: String

    init(text: String, variant: String) {
        self.text = text
        self.variant = variant
        input = ""
        value = ""
        selectedVariant = "default"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        text = try container.decodeIfPresent(String.self, forKey: .text) ?? ""
        variant = try container.decodeIfPresent(String.self, forKey: .variant) ?? "default"
        input = try container.decodeIfPresent(String.self, forKey: .input) ?? ""
        value = try container.decodeIfPresent(String.self, forKey: .value) ?? text
        selectedVariant = try container.decodeIfPresent(String.self, forKey: .selectedVariant) ?? "default"
    }

    private enum CodingKeys: String, CodingKey {
        case text, variant, input, value, selectedVariant
    }

    func scnVariant(selected: Bool = false) -> SCNBadge.Variant {
        switch selected ? selectedVariant : variant {
        case "secondary": return .secondary
        case "destructive": return .destructive
        case "outline": return .outline
        case "ghost": return .ghost
        case "link": return .link
        default: return .default
        }
    }
}

@NShiftPlugin(
    name: "Badge",
    version: "1.0.0",
    metadata: BadgeMetadata.self
)
struct BadgePlugin: NShiftPlugin {
    var body: some View {
        if metadata.input.isEmpty {
            SCNBadge(text: metadata.text, variant: metadata.scnVariant())
        } else if let screen = optionalViewModel(as: ScreenViewModel.self) {
            SelectableBadge(screen: screen, metadata: metadata) {
                screen.registerInput(id: metadata.input, value: metadata.value)
                fire(.onTap, engine: engine, renderID: renderID)
            }
        } else {
            SCNBadge(text: metadata.text, variant: metadata.scnVariant())
        }
    }
}

/// A badge bound to a screen input: observed so it shows its selected
/// variant while the input holds its value.
private struct SelectableBadge: View {
    @EnvironmentObject private var theme: SCNTheme
    @ObservedObject var screen: ScreenViewModel
    let metadata: BadgeMetadata
    let onTap: () -> Void

    var body: some View {
        let current = screen.inputs.first { $0.id == metadata.input }?.value ?? ""
        let selected = current == metadata.value
            || (current.isEmpty && metadata.value.isEmpty)
        Button(action: onTap) {
            SCNBadge(text: metadata.text, variant: metadata.scnVariant(selected: selected))
                // Opaque base clipped to the badge, so content scrolling under a
                // floating row never shows through translucent variants.
                .background(theme.palette.background, in: Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}
