import NShiftUI
import SwiftUI

@NShiftMetadata
struct AvatarMetadata: NShiftMetadata, Decodable {
    let initials: String
    let size: String

    func scnSize() -> SCNAvatar.Size {
        switch size {
        case "sm": return .sm
        case "lg": return .lg
        default: return .default
        }
    }
}

@NShiftPlugin(
    name: "Avatar",
    version: "1.0.0",
    metadata: AvatarMetadata.self
)
struct AvatarPlugin: NShiftPlugin {
    var body: some View {
        SCNAvatar(
            initials: metadata.initials,
            size: metadata.scnSize()
        )
    }
}
