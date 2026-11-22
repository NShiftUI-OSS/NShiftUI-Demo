import NShiftUI
import SwiftUI

@NShiftMetadata
struct AvatarMetadata: NShiftMetadata, Decodable {
    let initials: String
    let size: String
    let imageURL: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        initials = try container.decodeIfPresent(String.self, forKey: .initials) ?? ""
        size = try container.decodeIfPresent(String.self, forKey: .size) ?? "default"
        imageURL = try container.decodeIfPresent(String.self, forKey: .imageURL) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case initials
        case size
        case imageURL
    }

    func scnSize() -> SCNAvatar.Size {
        switch size {
        case "sm": return .sm
        case "lg": return .lg
        case "xl": return .xl
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
            size: metadata.scnSize(),
            imageURL: metadata.imageURL
        )
    }
}
