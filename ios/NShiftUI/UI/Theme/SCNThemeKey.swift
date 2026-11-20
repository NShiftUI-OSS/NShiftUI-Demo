import SwiftUI

struct SCNThemeKey: EnvironmentKey {
    static var defaultValue: SCNTheme {
        MainActor.assumeIsolated {
            SCNTheme.shared
        }
    }
}
