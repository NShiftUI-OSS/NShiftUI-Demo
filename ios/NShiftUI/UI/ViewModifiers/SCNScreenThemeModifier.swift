import SwiftUI
import UIKit

struct SCNScreenThemeModifier: ViewModifier {
    let themeName: String
    let interfaceStyle: UIUserInterfaceStyle
    @StateObject private var screenTheme: SCNTheme

    init(
        themeName: String,
        interfaceStyle: UIUserInterfaceStyle
    ) {
        self.themeName = themeName
        self.interfaceStyle = interfaceStyle
        _screenTheme = StateObject(
            wrappedValue: SCNTheme.scoped(
                themeName,
                interfaceStyle: interfaceStyle
            )
        )
    }

    func body(content: Content) -> some View {
        content
            .background(screenTheme.palette.background)
            .environmentObject(screenTheme)
            .environment(\.theme, screenTheme)
            .onChange(of: themeName) { name in
                screenTheme.set(SCNThemeID(rawValue: name) ?? .neutral)
            }
            .onChange(of: interfaceStyle) { style in
                let scheme: ColorScheme = style == .dark ? .dark : .light
                screenTheme.set(colorScheme: scheme)
            }
    }
}
