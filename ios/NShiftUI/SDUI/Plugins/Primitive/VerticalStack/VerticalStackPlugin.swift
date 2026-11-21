import NShiftUI
import SwiftUI

@NShiftMetadata
struct StackLayoutMetadata: NShiftMetadata, Decodable {
    let alignment: String
    let spacing: Double

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let rawAlignment = try container.decodeIfPresent(String.self, forKey: .alignment) ?? ""
        alignment = rawAlignment.hasPrefix(".") ? String(rawAlignment.dropFirst()) : rawAlignment
        if let double = try container.decodeIfPresent(Double.self, forKey: .spacing) {
            spacing = double
        } else if let int = try container.decodeIfPresent(Int.self, forKey: .spacing) {
            spacing = Double(int)
        } else {
            spacing = 0
        }
    }

    private enum CodingKeys: String, CodingKey {
        case alignment
        case spacing
    }

    func horizontalAlignment() -> HorizontalAlignment {
        switch resolved(default: "leading") {
        case "trailing", "topTrailing", "bottomTrailing":
            return .trailing
        case "center", "top", "bottom":
            return .center
        default:
            return .leading
        }
    }

    func verticalAlignment() -> VerticalAlignment {
        switch resolved(default: "top") {
        case "bottom", "bottomLeading", "bottomTrailing":
            return .bottom
        case "center", "leading", "trailing":
            return .center
        default:
            return .top
        }
    }

    func layerAlignment() -> Alignment {
        switch resolved(default: "topLeading") {
        case "top":
            return .top
        case "topTrailing":
            return .topTrailing
        case "leading":
            return .leading
        case "center":
            return .center
        case "trailing":
            return .trailing
        case "bottomLeading":
            return .bottomLeading
        case "bottom":
            return .bottom
        case "bottomTrailing":
            return .bottomTrailing
        default:
            return .topLeading
        }
    }

    private func resolved(default token: String) -> String {
        alignment.isEmpty ? token : alignment
    }
}

@NShiftPlugin(
    name: "VerticalStack",
    version: "1.0.0",
    metadata: StackLayoutMetadata.self
)
struct VerticalStackPlugin: NShiftPlugin {
    var body: some View {
        VStack(
            alignment: metadata.horizontalAlignment(),
            spacing: metadata.spacing
        ) {
            children()
        }
        .frame(
            maxWidth: .infinity,
            alignment: Alignment(
                horizontal: metadata.horizontalAlignment(),
                vertical: .top
            )
        )
    }
}
