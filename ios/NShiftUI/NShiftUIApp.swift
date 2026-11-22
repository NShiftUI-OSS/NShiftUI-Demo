import NShiftUI
import SwiftUI
import UIKit

@main
struct NShiftUIApp: App {
    private let navigator: AppNavigator

    init() {
        UIScrollView.appearance().showsVerticalScrollIndicator = false
        UIScrollView.appearance().showsHorizontalScrollIndicator = false
        SCNDesignSystem.install()
        let container = SwinjectNShiftContainer()
        NShiftConfig.shared.startup(
            hostContainer: container,
            assemblies: [
                ServicesAssembly(configuration: .current),
                CatalogAssembly(),
            ]
        )
        self.navigator = container.resolveUnwrapping(AppNavigator.self)
    }

    var body: some Scene {
        WindowGroup {
            NavigationHost()
                .themeSync()
                .environmentObject(navigator)
        }
    }
}
