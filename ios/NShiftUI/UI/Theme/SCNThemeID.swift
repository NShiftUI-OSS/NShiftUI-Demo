import SwiftUI

enum SCNThemeID: String, CaseIterable, Identifiable {
    case neutral
    case stone
    case zinc
    case mauve
    case olive
    case mist
    case taupe
    case amber
    case blue
    case cyan
    case emerald
    case fuchsia
    case green
    case indigo
    case lime
    case orange
    case pink
    case purple
    case red
    case rose
    case sky
    case teal
    case violet
    case yellow

    var id: String { rawValue }

    var title: String { SCNThemePreset.named(self).title }

    static func resolve(_ raw: String) -> SCNThemeID? {
        let key = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard key.isEmpty == false else { return nil }
        return allCases.first {
            $0.rawValue.lowercased() == key || $0.title.lowercased() == key
        }
    }
}
