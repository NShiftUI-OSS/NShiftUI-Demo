import NShiftUI
import SwiftUI

@NShiftMetadata
struct ItemMetadata: NShiftMetadata, Decodable {
    let title: String
    let subtitle: String
    let initials: String
}

@NShiftPlugin(
    name: "Item",
    version: "1.0.0",
    metadata: ItemMetadata.self
)
struct ItemPlugin: NShiftPlugin {
    var body: some View {
        SCNItem(
            title: metadata.title,
            subtitle: metadata.subtitle,
            initials: metadata.initials
        )
    }
}
