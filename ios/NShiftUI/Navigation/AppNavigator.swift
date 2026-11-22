import Foundation
import SwiftUI

final class AppNavigator: ObservableObject, @unchecked Sendable {
    @Published private(set) var entries: [NavigationEntry]
    /// Screen presented modally over the stack (`presentation: "modal"`).
    @Published var modal: NavigationEntry?

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

    func push(
        screenName: String?,
        parameters: [String: String] = [:]
    ) {
        guard let screenName, screenName.isEmpty == false else {
            return
        }
        var components = URLComponents(
            string: "nshift://screen/\(screenName)"
        )
        components?.queryItems = parameters.map {
            URLQueryItem(name: $0.key, value: $0.value)
        }
        push(components?.string ?? "nshift://screen/\(screenName)")
    }

    @MainActor
    func pushAsync(
        screenName: String?,
        parameters: [String: String] = [:]
    ) async -> Bool {
        guard let screenName, screenName.isEmpty == false else {
            return false
        }
        var components = URLComponents(
            string: "nshift://screen/\(screenName)"
        )
        components?.queryItems = parameters.map {
            URLQueryItem(name: $0.key, value: $0.value)
        }
        guard let raw = components?.string,
              let parsed = Deeplink.parse(raw) else {
            return false
        }
        let builder = Screen()
            .url(
                NShiftAppConfiguration.current.runtimeScreenURL(
                    for: screenName,
                    parameters: parameters
                )
            )
            .routeParameters(parameters)
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

    func present(
        screenName: String?,
        parameters: [String: String] = [:]
    ) {
        guard let screenName, screenName.isEmpty == false else {
            return
        }
        var components = URLComponents(
            string: "nshift://screen/\(screenName)"
        )
        components?.queryItems = parameters.map {
            URLQueryItem(name: $0.key, value: $0.value)
        }
        guard let parsed = Deeplink.parse(components?.string ?? "nshift://screen/\(screenName)") else {
            return
        }
        modal = NavigationEntry(deeplink: parsed)
    }

    /// Closes the modal screen; false when none is presented.
    @discardableResult
    func dismissModal() -> Bool {
        guard modal != nil else { return false }
        modal = nil
        return true
    }

    func pop() {
        pop(steps: 1)
    }

    func pop(steps: Int) {
        let times = max(steps, 1)
        popToCount(max(1, entries.count - times))
    }

    func popToRoot() {
        popToCount(1)
    }

    func pop(toScreen name: String) {
        pop(to: "nshift://screen/\(name)")
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
