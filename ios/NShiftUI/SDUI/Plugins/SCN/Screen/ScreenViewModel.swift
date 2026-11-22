import Combine
import Foundation
import NShiftUI

struct ScreenBottomSheet: Identifiable, Equatable {
    let id: String
    var presented: Bool
}

struct ScreenInput: Identifiable, Equatable {
    let id: String
    var value: String
}

@MainActor
protocol ScreenSheetLayer: AnyObject {
    func openSheet(id: String) async -> Bool
    func closeSheet(id: String) async -> Bool
}

protocol ScreenHTTPLayer: AnyObject {
    func sendHTTPRequest(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse
}

@MainActor
final class ScreenViewModel: ObservableObject, NShiftPluginViewModel, ScreenSheetLayer, ScreenHTTPLayer {
    @Published private(set) var bottomSheets: [ScreenBottomSheet] = []
    @Published private(set) var inputs: [ScreenInput] = []
    @Published private(set) var routeParameters: [String: String] = [:]
    /// Selected tab of a screen with a TabBar; `ChangeTabEvent` changes it.
    @Published var selectedTab = 0

    private let http: any SendHTTPRequestUseCaseProtocol
    private var refreshObserver: ScreenRefreshObserver?
    private var sheetRegistrations: [String: Int] = [:]
    /// Generic list state (see `ScreenLists`): datasets, pagination and
    /// the `ForEach` filter values, keyed by list id.
    let lists = ScreenLists()
    private var didFireAppear = false
    private var presentWaiters: [String: CheckedContinuation<Void, Never>] = [:]
    private var dismissWaiters: [String: CheckedContinuation<Void, Never>] = [:]

    nonisolated init(http: any SendHTTPRequestUseCaseProtocol) {
        self.http = http
    }

    /// Values templates can read: `{{route.x}}` and `{{input.x}}`.
    func templateContext() -> [String: Any] {
        [
            "route": routeParameters,
            "input": Dictionary(inputs.map { ($0.id, $0.value) }, uniquingKeysWith: { _, last in last }),
        ]
    }

    func bindRouteParameters(_ parameters: [String: String]) {
        routeParameters = parameters
    }

    /// True only the first time the screen appears, so `OnAppear` fires once
    /// per screen instance (not again when a retained tab comes back).
    func markAppeared() -> Bool {
        guard didFireAppear == false else { return false }
        didFireAppear = true
        return true
    }

    func bind(refresh: ScreenRefreshObserver?) {
        refreshObserver = refresh
    }

    func refresh() async {
        await refreshObserver?.refresh()
    }

    func registerSheet(id: String) {
        sheetRegistrations[id, default: 0] += 1
        guard bottomSheets.contains(where: { $0.id == id }) == false else {
            return
        }
        bottomSheets.append(
            ScreenBottomSheet(
                id: id,
                presented: false
            )
        )
    }

    func unregisterSheet(id: String) {
        let remaining = (sheetRegistrations[id] ?? 1) - 1
        guard remaining <= 0 else {
            sheetRegistrations[id] = remaining
            return
        }
        sheetRegistrations[id] = nil
        bottomSheets.removeAll { $0.id == id }
    }

    func openSheet(id: String) async -> Bool {
        guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
            return false
        }
        bottomSheets[index].presented = true
        await withCheckedContinuation { continuation in
            presentWaiters[id] = continuation
        }
        return true
    }

    func closeSheet(id: String) async -> Bool {
        guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
            return false
        }
        bottomSheets[index].presented = false
        await withCheckedContinuation { continuation in
            dismissWaiters[id] = continuation
        }
        return true
    }

    func didPresent(ids: [String]) {
        resume(
            ids: ids,
            from: &presentWaiters
        )
    }

    func didDismiss(ids: [String]) {
        for id in ids {
            guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
                continue
            }
            bottomSheets[index].presented = false
        }
        resume(
            ids: ids,
            from: &dismissWaiters
        )
    }

    func registerInput(
        id: String,
        value: String
    ) {
        if let index = inputs.firstIndex(where: { $0.id == id }) {
            inputs[index].value = value
            return
        }
        inputs.append(
            ScreenInput(
                id: id,
                value: value
            )
        )
    }

    func registerInput(
        engine: (any NShiftEngine)?,
        renderID: NShiftRenderID,
        value: some Any
    ) {
        let id: String
        if let tree = engine as? any NShiftEngineTree,
           let serverID = tree.node(withRenderID: renderID)?.model.id {
            id = serverID
        } else {
            id = renderID.rawValue
        }
        registerInput(
            id: id,
            value: String(describing: value)
        )
    }

    func sendHTTPRequest(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse {
        try await http.execute(request)
    }

    private func resume(
        ids: [String],
        from waiters: inout [String: CheckedContinuation<Void, Never>]
    ) {
        for id in ids {
            waiters.removeValue(forKey: id)?.resume()
        }
    }
}

extension ScreenViewModel {
    private final class WeakReference {
        weak var value: ScreenViewModel?

        init(_ value: ScreenViewModel) {
            self.value = value
        }
    }

    private static var active: [ObjectIdentifier: WeakReference] = [:]

    static func activate(_ viewModel: ScreenViewModel, for engine: (any NShiftEngine)?) {
        guard let engine else { return }
        active = active.filter { $0.value.value != nil }
        active[ObjectIdentifier(engine as AnyObject)] = WeakReference(viewModel)
        engine.pluginViewModel = viewModel
    }

    static func resolve(
        engine: (any NShiftEngine)?,
        fallback: (any NShiftPluginViewModel)?
    ) -> ScreenViewModel? {
        if let engine,
           let registered = active[ObjectIdentifier(engine as AnyObject)]?.value {
            return registered
        }
        return fallback as? ScreenViewModel
    }
}
