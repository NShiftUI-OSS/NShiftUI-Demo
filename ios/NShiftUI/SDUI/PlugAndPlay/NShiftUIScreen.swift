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
    fileprivate let phase: Phase

    init() {
        screenURL = nil
        screenTitle = nil
        phase = .pending
    }

    private init(
        screenURL: String?,
        screenTitle: String?,
        phase: Phase
    ) {
        self.screenURL = screenURL
        self.screenTitle = screenTitle
        self.phase = phase
    }

    func url(_ value: String) -> Self {
        Self(
            screenURL: value,
            screenTitle: screenTitle,
            phase: .pending
        )
    }

    func title(_ value: String?) -> Self {
        let title = value?.trimmingCharacters(in: .whitespacesAndNewlines)
        return Self(
            screenURL: screenURL,
            screenTitle: title?.isEmpty == false ? title : nil,
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
                phase: .failed
            )
        }

        do {
            let model = try await useCase.execute(url: screenURL)
            return Self(
                screenURL: screenURL,
                screenTitle: screenTitle,
                phase: .loaded(model)
            )
        } catch {
            return Self(
                screenURL: screenURL,
                screenTitle: screenTitle,
                phase: .failed
            )
        }
    }

    @ViewBuilder
    func resolve(onBack: (() -> Void)? = nil) -> some View {
        ResolvedScreen(
            builder: self,
            onBack: onBack
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

    nonisolated static func == (
        lhs: StableNShiftScreen,
        rhs: StableNShiftScreen
    ) -> Bool {
        lhs.token == rhs.token
    }

    var body: some View {
        NShiftView(model: model)
    }
}

private struct ResolvedScreen: View {
    let builder: Screen
    let onBack: (() -> Void)?
    @StateObject private var refresh = ScreenRefreshObserver()
    @State private var phase: Screen.Phase
    @State private var generation = 0
    @State private var retrying = false

    init(builder: Screen, onBack: (() -> Void)?) {
        self.builder = builder
        self.onBack = onBack
        _phase = State(initialValue: builder.phase)
    }

    var body: some View {
        content
            .task {
                guard case .pending = phase else {
                    return
                }
                phase = await builder.load().phase
            }
            .onReceive(refresh.subject) { _ in
                Task { @MainActor in
                    let loaded = await builder.load()
                    if loaded.isLoaded {
                        phase = loaded.phase
                        generation += 1
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
                    let started = DispatchTime.now().uptimeNanoseconds
                    let loaded = await builder.load()
                    await holdRetryLoading(since: started)
                    phase = loaded.phase
                    retrying = false
                }
            }
        case .loaded(let model):
            StableNShiftScreen(
                token: "\(builder.screenURL ?? "")#\(generation)",
                model: model
            )
            .equatable()
            .environment(\.screenRefresh, refresh)
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
                    let started = DispatchTime.now().uptimeNanoseconds
                    let loaded = await builder.load()
                    await holdRetryLoading(since: started)
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
        let loaded = await builder.load()
        if loaded.isLoaded {
            loadedBuilder = loaded
        } else {
            failed = true
        }
    }
}

private let retryLoadingFloorNanos: UInt64 = 800_000_000

private func holdRetryLoading(since start: UInt64) async {
    let elapsed = DispatchTime.now().uptimeNanoseconds &- start
    guard elapsed < retryLoadingFloorNanos else { return }
    try? await Task.sleep(nanoseconds: retryLoadingFloorNanos &- elapsed)
}
