import NShiftUI

struct ServicesAssembly: NShiftDependencyAssembly {
    private let configuration: NShiftAppConfiguration

    init(configuration: NShiftAppConfiguration = .current) {
        self.configuration = configuration
    }

    @MainActor
    func assemblePlugins(in container: any NShiftDependencyContainer) {
        container.register(
            APIClient.self,
            scope: .singleton
        ) {
            APIClient(
                baseURL: configuration.backendBaseURL,
                trustLocalCertificate: configuration.environment == .local
            )
        }
        container.register(
            AppNavigator.self,
            scope: .singleton
        ) {
            AppNavigator()
        }
        container.register(
            (any ScreenServiceProtocol).self,
            scope: .singleton
        ) {
            ScreenService(client: container.resolveUnwrapping(APIClient.self))
        }
        container.register(
            (any FetchScreenUseCaseProtocol).self,
            scope: .singleton
        ) {
            FetchScreenUseCase(
                service: container.resolveUnwrapping((any ScreenServiceProtocol).self)
            )
        }
        container.register(
            (any SendHTTPRequestServiceProtocol).self,
            scope: .singleton
        ) {
            SendHTTPRequestService(client: container.resolveUnwrapping(APIClient.self))
        }
        container.register(
            (any SendHTTPRequestUseCaseProtocol).self,
            scope: .singleton
        ) {
            SendHTTPRequestUseCase(
                service: container.resolveUnwrapping((any SendHTTPRequestServiceProtocol).self)
            )
        }
        container.register(
            ScreenViewModel.self,
            scope: .transient
        ) {
            // A Screen is resolved again whenever SwiftUI rebuilds it. Reuse
            // the view model already active for the engine being rendered so
            // its state (filter inputs, pagination, sheets) is kept.
            MainActor.assumeIsolated {
                ScreenViewModel.resolve(engine: NShiftRenderingEngine.current, fallback: nil)
            } ?? ScreenViewModel(
                http: container.resolveUnwrapping((any SendHTTPRequestUseCaseProtocol).self)
            )
        }
    }
}
