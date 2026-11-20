import NShiftUI
import SwiftUI

@NShiftMetadata
struct BadgeMetadata: NShiftMetadata, Decodable {
    let text: String
    let variant: String

    func scnVariant() -> SCNBadge.Variant {
        switch variant {
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
        SCNBadge(
            text: metadata.text,
            variant: metadata.scnVariant()
        )
    }
}
