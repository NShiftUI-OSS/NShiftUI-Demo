import NShiftUI
import SwiftUI

@NShiftMetadata
struct FloatingButtonMetadata: NShiftMetadata, Decodable {
    let icon: String
    /// Fixed badge text; empty hides it.
    let badge: String
    /// App-scoped list (`AppLists`) whose item count is the badge; zero hides it.
    let badgeList: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? "plus"
        badge = try container.decodeIfPresent(String.self, forKey: .badge) ?? ""
        badgeList = try container.decodeIfPresent(String.self, forKey: .badgeList) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case icon, badge, badgeList
    }
}

/// `FloatingButton(icon:, badgeList:)`: round button placed by the screen's
/// `FloatingButton` slot over the content. `OnTap` runs its events.
@NShiftPlugin(
    name: "FloatingButton",
    version: "1.0.0",
    metadata: FloatingButtonMetadata.self
)
struct FloatingButtonPlugin: NShiftPlugin {
    var body: some View {
        FloatingButtonView(metadata: metadata) {
            fire(.onTap, engine: engine, renderID: renderID)
        }
    }
}

private struct FloatingButtonView: View {
    @ObservedObject private var lists = AppLists.shared
    let metadata: FloatingButtonMetadata
    let onTap: () -> Void

    var body: some View {
        SCNFloatingButton(
            icon: SCNIconName(rawValue: metadata.icon),
            badge: badge,
            action: onTap
        )
    }

    private var badge: String? {
        if metadata.badgeList.isEmpty == false {
            let count = lists.count(metadata.badgeList)
            return count > 0 ? (count > 99 ? "99+" : String(count)) : nil
        }
        return metadata.badge.isEmpty ? nil : metadata.badge
    }
}
