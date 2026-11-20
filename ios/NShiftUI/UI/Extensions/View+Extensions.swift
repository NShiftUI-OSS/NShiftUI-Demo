import SwiftUI
import UIKit

extension View {
    func scnScreenTheme(
        name: String,
        interfaceStyle: UIUserInterfaceStyle
    ) -> some View {
        modifier(
            SCNScreenThemeModifier(
                themeName: name,
                interfaceStyle: interfaceStyle
            )
        )
    }

    func themeSync() -> some View {
        SCNThemeSync {
            self
        }
    }

    func scnNavigationBar(
        title: String,
        size: SCNNavigationBarSize = .inline,
        leading: SCNNavigationBarLeading = .none,
        center: Image? = nil,
        trailing: SCNNavigationBarTrailing = .none,
        isTranslucent: Bool = false,
        background: Color? = nil
    ) -> some View {
        modifier(
            SCNNavigationBarModifier(
                title: title,
                size: size,
                leading: leading,
                center: center,
                trailing: trailing,
                isTranslucent: isTranslucent,
                background: background
            )
        )
    }

    func scnNavigationBar(
        title: String,
        size: SCNNavigationBarSize = .inline,
        leading: SCNNavigationBarLeading = .none,
        center: Image,
        trailing: SCNNavigationBarTrailing = .none,
        isTranslucent: Bool = false,
        background: Color? = nil
    ) -> some View {
        modifier(
            SCNNavigationBarModifier(
                title: title,
                size: size,
                leading: leading,
                center: center,
                trailing: trailing,
                isTranslucent: isTranslucent,
                background: background
            )
        )
    }
}
