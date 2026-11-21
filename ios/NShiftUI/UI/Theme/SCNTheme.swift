import SwiftUI
import UIKit

@MainActor
final class SCNTheme: ObservableObject {
    private static let storageKey = "scn.global.ds.theme"

    static let shared = SCNTheme(
        preset: SCNThemePreset.named(storedThemeID()),
        interfaceStyle: .light
    )

    private static func storedThemeID() -> SCNThemeID {
        let raw = UserDefaults.standard.string(forKey: storageKey) ?? ""
        return SCNThemeID.resolve(raw) ?? .neutral
    }

    @Published private(set) var preset: SCNThemePreset
    @Published private(set) var interfaceStyle: UIUserInterfaceStyle
    @Published private(set) var fontFamily: String

    let spacing = SCNSpacingTokens.standard
    let radius = SCNRadiusTokens.standard
    let border = SCNBorderTokens.standard
    let type = SCNTypeTokens.standard
    let opacity = SCNOpacityTokens.standard
    let animation = SCNAnimationTokens.standard

    init(
        preset: SCNThemePreset,
        interfaceStyle: UIUserInterfaceStyle
    ) {
        self.preset = preset
        self.interfaceStyle = interfaceStyle
        fontFamily = "Geist"
    }

    static func scoped(
        _ name: String,
        interfaceStyle: UIUserInterfaceStyle
    ) -> SCNTheme {
        let id = SCNThemeID(rawValue: name) ?? .neutral
        return SCNTheme(
            preset: SCNThemePreset.named(id),
            interfaceStyle: interfaceStyle
        )
    }

    var palette: SCNThemePalette {
        interfaceStyle == .dark ? preset.dark : preset.light
    }

    var backgroundUIColor: UIColor {
        palette.backgroundUIColor
    }

    func font(
        _ size: CGFloat,
        weight: Font.Weight = .regular
    ) -> Font {
        Font.custom(
            fontFamily,
            size: size
        ).weight(weight)
    }

    func uiFont(
        _ size: CGFloat,
        weight: UIFont.Weight = .regular
    ) -> UIFont {
        let named = UIFont(
            name: fontFamily,
            size: size
        )
        return named ?? UIFont.systemFont(
            ofSize: size,
            weight: weight
        )
    }

    @Published private(set) var revision = 0

    func set(_ id: SCNThemeID) {
        guard preset.id != id else { return }
        preset = SCNThemePreset.named(id)
        revision += 1
    }

    func applyGlobal(_ id: SCNThemeID) {
        UserDefaults.standard.set(id.rawValue, forKey: Self.storageKey)
        set(id)
    }

    func set(colorScheme: ColorScheme) {
        let style: UIUserInterfaceStyle = colorScheme == .dark ? .dark : .light
        guard interfaceStyle != style else { return }
        interfaceStyle = style
        revision += 1
    }

    func set(fontFamily: String) {
        guard self.fontFamily != fontFamily else { return }
        self.fontFamily = fontFamily
        revision += 1
    }
}

extension EnvironmentValues {
    var theme: SCNTheme {
        get { self[SCNThemeKey.self] }
        set { self[SCNThemeKey.self] = newValue }
    }
}
