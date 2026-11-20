import Foundation
import SwiftUI

final class AppNavigator: ObservableObject, @unchecked Sendable {
    @Published private(set) var entries: [NavigationEntry]

    init() {
        let root = Deeplink.parse(Deeplink.home)
        self.entries = [
            NavigationEntry(deeplink: root ?? Deeplink(
                screenName: "home",
                parameters: [:],
                raw: Deeplink.home
            )),
        ]
    }

    var canPop: Bool {
        entries.count > 1
    }

    func push(_ deeplink: String) {
        guard let parsed = Deeplink.parse(deeplink) else {
            return
        }
        entries.append(NavigationEntry(deeplink: parsed))
    }

    func push(screenName: String?) {
        guard let screenName, screenName.isEmpty == false else {
            return
        }
        push("nshift://screen/\(screenName)")
    }

    @MainActor
    func pushAsync(screenName: String?) async -> Bool {
        guard let screenName, screenName.isEmpty == false else {
            return false
        }
        guard let parsed = Deeplink.parse("nshift://screen/\(screenName)") else {
            return false
        }
        let builder = Screen()
            .url(NShiftAppConfiguration.current.runtimeScreenURL(for: screenName))
            .title(screenName)
        let loaded = await builder.load()
        guard let model = loaded.loadedModel else {
            return false
        }
        entries.append(
            NavigationEntry(
                deeplink: parsed,
                preloadedModel: model
            )
        )
        return true
    }

    func pop() {
        popToCount(entries.count - 1)
    }

    func popToCount(_ count: Int) {
        guard count >= 1, count < entries.count else {
            return
        }
        entries = Array(entries.prefix(count))
    }

    func pop(to deeplink: String) {
        guard let target = Deeplink.parse(deeplink),
              let index = entries.lastIndex(where: { entry in
                  entry.screenName == target.screenName
              }) else {
            return
        }
        guard index < entries.count - 1 else {
            return
        }
        entries = Array(entries.prefix(index + 1))
    }
}
