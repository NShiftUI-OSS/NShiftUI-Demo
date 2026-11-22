import NShiftUI
import SwiftUI

@MainActor
struct Screen {
    enum Phase {
        case pending
        case failed
        case loaded(NShiftPluginModel)
    }

    fileprivate let screenURL: String?
    fileprivate let screenTitle: String?
    fileprivate let routeParameters: [String: String]
    fileprivate let phase: Phase

    init() {
        screenURL = nil
        screenTitle = nil
        routeParameters = [:]
        phase = .pending
    }

    private init(
        screenURL: String?,
        screenTitle: String?,
        routeParameters: [String: String],
        phase: Phase
    ) {
        self.screenURL = screenURL
        self.screenTitle = screenTitle
        self.routeParameters = routeParameters
        self.phase = phase
    }

    func url(_ value: String) -> Self {
        Self(
            screenURL: value,
            screenTitle: screenTitle,
            routeParameters: routeParameters,
            phase: .pending
        )
    }

    func title(_ value: String?) -> Self {
        let title = value?.trimmingCharacters(in: .whitespacesAndNewlines)
        return Self(
            screenURL: screenURL,
            screenTitle: title?.isEmpty == false ? title : nil,
            routeParameters: routeParameters,
            phase: phase
        )
    }

    func routeParameters(_ value: [String: String]) -> Self {
        Self(
            screenURL: screenURL,
            screenTitle: screenTitle,
            routeParameters: value,
            phase: phase
        )
    }

    var isLoaded: Bool {
        if case .loaded = phase {
            return true
        }
        return false
    }

    var loadedModel: NShiftPluginModel? {
        if case .loaded(let model) = phase {
            return model
        }
        return nil
    }

    func preloaded(_ model: NShiftPluginModel) -> Self {
        Self(
            screenURL: screenURL,
            screenTitle: screenTitle,
            routeParameters: routeParameters,
            phase: .loaded(model)
        )
    }

    func load() async -> Self {
        guard let screenURL,
              screenURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false,
              let container = NShiftConfig.shared.hostContainer,
              let useCase = container.resolve((any FetchScreenUseCaseProtocol).self)
        else {
            return Self(
                screenURL: screenURL,
                screenTitle: screenTitle,
                routeParameters: routeParameters,
                phase: .failed
            )
        }

        do {
            let model = try await useCase.execute(url: screenURL)
            return Self(
                screenURL: screenURL,
                screenTitle: screenTitle,
                routeParameters: routeParameters,
                phase: .loaded(model)
            )
        } catch {
            return Self(
                screenURL: screenURL,
                screenTitle: screenTitle,
                routeParameters: routeParameters,
                phase: .failed
            )
        }
    }

    @ViewBuilder
    func resolve(
        onBack: (() -> Void)? = nil,
        retainKey: String? = nil
    ) -> some View {
        ResolvedScreen(
            builder: self,
            onBack: onBack,
            retainKey: retainKey
        )
    }

    @ViewBuilder
    func startup(onBack: (() -> Void)? = nil) -> some View {
        ScreenStartup(
            builder: self,
            onBack: onBack
        )
    }
}

private struct StableNShiftScreen: View, Equatable {
    let token: String
    let model: NShiftPluginModel
    var retainKey: String? = nil

    nonisolated static func == (
        lhs: StableNShiftScreen,
        rhs: StableNShiftScreen
    ) -> Bool {
        lhs.token == rhs.token
    }

    var body: some View {
        if let retainKey {
            NShiftView(
                engine: RetainedScreenStore.shared.engine(
                    for: retainKey,
                    token: token,
                    model: model
                )
            )
        } else {
            NShiftView(model: model)
        }
    }
}

@MainActor
private final class RetainedScreenStore {
    static let shared = RetainedScreenStore()

    private struct Entry {
        var phase: Screen.Phase
        var token: String?
        var engine: (any NShiftEngine)?
    }

    private var entries: [String: Entry] = [:]

    func phase(for key: String) -> Screen.Phase? {
        entries[key]?.phase
    }

    func store(_ phase: Screen.Phase, for key: String) {
        entries[key, default: Entry(phase: phase)].phase = phase
    }

    func engine(for key: String, token: String, model: NShiftPluginModel) -> any NShiftEngine {
        if let entry = entries[key], entry.token == token, let engine = entry.engine {
            return engine
        }
        let engine = NShiftView.makeEngine(for: model)
        entries[key, default: Entry(phase: .loaded(model))].token = token
        entries[key]?.engine = engine
        return engine
    }
}

private struct ResolvedScreen: View {
    let builder: Screen
    let onBack: (() -> Void)?
    let retainKey: String?
    @StateObject private var refresh = ScreenRefreshObserver()
    @State private var phase: Screen.Phase
    @State private var generation = 0
    @State private var retrying = false

    init(builder: Screen, onBack: (() -> Void)?, retainKey: String? = nil) {
        self.builder = builder
        self.onBack = onBack
        self.retainKey = retainKey
        let retained = retainKey.flatMap { RetainedScreenStore.shared.phase(for: $0) }
        _phase = State(initialValue: retained ?? builder.phase)
    }

    var body: some View {
        content
            .task {
                guard case .pending = phase else {
                    return
                }
                let started = DispatchTime.now().uptimeNanoseconds
                let loaded = await builder.load()
                await holdFetchPresentation(since: started)
                phase = loaded.phase
                if let retainKey {
                    RetainedScreenStore.shared.store(loaded.phase, for: retainKey)
                }
            }
            .onReceive(refresh.subject) { _ in
                Task { @MainActor in
                    let loaded = await builder.load()
                    if loaded.isLoaded {
                        phase = loaded.phase
                        generation += 1
                        if let retainKey {
                            RetainedScreenStore.shared.store(loaded.phase, for: retainKey)
                        }
                    }
                    refresh.finish()
                }
            }
    }

    @ViewBuilder
    private var content: some View {
        switch phase {
        case .pending:
            LoadingScreen()
        case .failed:
            ErrorScreen(title: builder.screenTitle) {
                guard !retrying else { return }
                retrying = true
                phase = .pending
                Task {
                    await waitBeforeRetry()
                    let loaded = await builder.load()
                    phase = loaded.phase
                    retrying = false
                }
            }
        case .loaded(let model):
            StableNShiftScreen(
                token: "\(builder.screenURL ?? "")#\(generation)",
                model: model,
                retainKey: retainKey
            )
            .equatable()
            .environment(\.screenRefresh, refresh)
            .environment(
                \.screenRouteParameters,
                builder.routeParameters
            )
        }
    }
}

private struct ScreenStartup: View {
    let builder: Screen
    let onBack: (() -> Void)?
    @State private var loadedBuilder: Screen?
    @State private var failed = false
    @State private var retrying = false

    var body: some View {
        content
            .task(id: builder.screenURL) {
                await start()
            }
    }

    @ViewBuilder
    private var content: some View {
        if let loadedBuilder {
            loadedBuilder.resolve(onBack: onBack)
        } else if failed {
            ErrorScreen(title: builder.screenTitle) {
                guard !retrying else { return }
                retrying = true
                failed = false
                Task {
                    await waitBeforeRetry()
                    let loaded = await builder.load()
                    if loaded.isLoaded {
                        loadedBuilder = loaded
                    } else {
                        failed = true
                    }
                    retrying = false
                }
            }
        } else {
            NShiftLaunchScreen()
        }
    }

    private func start() async {
        failed = false
        let started = DispatchTime.now().uptimeNanoseconds
        let loaded = await builder.load()
        await holdFetchPresentation(since: started)
        if loaded.isLoaded {
            loadedBuilder = loaded
        } else {
            failed = true
        }
    }
}

private let fetchPresentationFloorNanos: UInt64 = 1_000_000_000
private let retryDelayNanos: UInt64 = 1_000_000_000

private func holdFetchPresentation(since start: UInt64) async {
    let elapsed = DispatchTime.now().uptimeNanoseconds &- start
    guard elapsed < fetchPresentationFloorNanos else { return }
    try? await Task.sleep(nanoseconds: fetchPresentationFloorNanos &- elapsed)
}

private func waitBeforeRetry() async {
    try? await Task.sleep(nanoseconds: retryDelayNanos)
}
