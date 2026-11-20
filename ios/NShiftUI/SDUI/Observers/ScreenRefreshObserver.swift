import Combine
import SwiftUI

@MainActor
final class ScreenRefreshObserver: ObservableObject {
    let subject = PassthroughSubject<Void, Never>()
    private var waiter: CheckedContinuation<Void, Never>?

    func refresh() async {
        await withCheckedContinuation { continuation in
            waiter = continuation
            subject.send()
        }
    }

    func finish() {
        waiter?.resume()
        waiter = nil
    }
}

private struct ScreenRefreshKey: EnvironmentKey {
    static let defaultValue: ScreenRefreshObserver? = nil
}

extension EnvironmentValues {
    var screenRefresh: ScreenRefreshObserver? {
        get { self[ScreenRefreshKey.self] }
        set { self[ScreenRefreshKey.self] = newValue }
    }
}
