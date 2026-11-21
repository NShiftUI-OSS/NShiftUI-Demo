import NShiftUI
import SwiftUI

@NShiftMetadata
struct TextMetadata: NShiftMetadata, Decodable {
    let text: String
    let style: String
    let weight: String
    let color: String
    let alignment: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        text = try container.decodeIfPresent(String.self, forKey: .text) ?? ""
        style = try container.decodeIfPresent(String.self, forKey: .style) ?? "sm"
        weight = try container.decodeIfPresent(String.self, forKey: .weight) ?? "regular"
        color = try container.decodeIfPresent(String.self, forKey: .color) ?? "foreground"
        let rawAlignment = try container.decodeIfPresent(String.self, forKey: .alignment) ?? "leading"
        alignment = rawAlignment.hasPrefix(".") ? String(rawAlignment.dropFirst()) : rawAlignment
    }

    private enum CodingKeys: String, CodingKey {
        case text
        case style
        case weight
        case color
        case alignment
    }

    func textAlignment() -> TextAlignment {
        switch alignment {
        case "center":
            return .center
        case "trailing":
            return .trailing
        default:
            return .leading
        }
    }

    func frameAlignment() -> Alignment {
        switch alignment {
        case "center":
            return .center
        case "trailing":
            return .trailing
        default:
            return .leading
        }
    }

    func scnStyle() -> SCNText.Style {
        switch style {
        case "xs": return .xs
        case "base": return .base
        case "lg": return .lg
        case "xl": return .xl
        case "xl2": return .xl2
        default: return .sm
        }
    }

    func scnWeight() -> SCNText.Weight {
        switch weight {
        case "medium": return .medium
        case "semibold": return .semibold
        default: return .regular
        }
    }

    func scnColor() -> SCNText.Color {
        switch color {
        case "mutedForeground": return .mutedForeground
        case "primary": return .primary
        case "primaryForeground": return .primaryForeground
        case "secondaryForeground": return .secondaryForeground
        case "accentForeground": return .accentForeground
        case "destructive": return .destructive
        case "cardForeground": return .cardForeground
        case "popoverForeground": return .popoverForeground
        case "white": return .white
        default: return .foreground
        }
    }
}

@NShiftPlugin(
    name: "Text",
    version: "1.0.0",
    metadata: TextMetadata.self
)
struct TextPlugin: NShiftPlugin {
    var body: some View {
        let text = SCNText(
            metadata.text,
            style: metadata.scnStyle(),
            weight: metadata.scnWeight(),
            color: metadata.scnColor()
        )
        .multilineTextAlignment(metadata.textAlignment())

        if style.frame.hasFixedWidth || style.frame.hasFixedHeight {
            text.frame(
                maxWidth: style.frame.hasFixedWidth ? .infinity : nil,
                maxHeight: style.frame.hasFixedHeight ? .infinity : nil,
                alignment: metadata.frameAlignment()
            )
        } else {
            text
        }
    }
}
