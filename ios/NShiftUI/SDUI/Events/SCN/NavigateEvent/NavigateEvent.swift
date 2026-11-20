import NShiftUI

@NShiftMetadata
struct NavigateEventMetadata: NShiftMetadata, Decodable {
    let screenName: String?
}

@NShiftEvent(
    name: "NavigateEvent",
    version: "1.0.0",
    metadata: NavigateEventMetadata.self
)
struct NavigateEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let navigator = resolver.resolveUnwrapping(AppNavigator.self)
        guard let screenName = metadata.screenName,
              screenName.isEmpty == false else {
            return
        }
        await MainActor.run {
            navigator.push(screenName: screenName)
        }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}

@NShiftMetadata
struct AsyncNavigateEventMetadata: NShiftMetadata, Decodable {
    let screenName: String?
}

@NShiftEvent(
    name: "AsyncNavigateEvent",
    version: "1.0.0",
    metadata: AsyncNavigateEventMetadata.self
)
struct AsyncNavigateEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let navigator = resolver.resolveUnwrapping(AppNavigator.self)
        guard let screenName = metadata.screenName,
              screenName.isEmpty == false else {
            return
        }
        guard await navigator.pushAsync(screenName: screenName) else {
            return
        }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}
