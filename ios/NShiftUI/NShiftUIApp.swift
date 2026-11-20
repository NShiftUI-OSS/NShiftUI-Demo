import NShiftUI
import SwiftUI

@main
struct NShiftUIApp: App {
    private let navigator: AppNavigator

    init() {
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
