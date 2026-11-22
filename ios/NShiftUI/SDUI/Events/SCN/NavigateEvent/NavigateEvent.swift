import NShiftUI

@NShiftMetadata
struct NavigateEventMetadata: NShiftMetadata, Decodable {
    let screenName: String?
    let parameters: [String: String]

    init(
        screenName: String,
        parameters: [String: String] = [:]
    ) {
        self.screenName = screenName
        self.parameters = parameters
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        screenName = try container.decodeIfPresent(String.self, forKey: .screenName)
            ?? ""
        parameters = try container.decodeIfPresent(
            [String: String].self,
            forKey: .parameters
        ) ?? [:]
    }

    private enum CodingKeys: String, CodingKey {
        case screenName
        case parameters
    }
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
            navigator.push(
                screenName: screenName,
                parameters: metadata.parameters
            )
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
struct BackNavigationEventMetadata: NShiftMetadata, Decodable {
    let steps: Int
    let destination: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        if let value = try container.decodeIfPresent(Int.self, forKey: .steps) {
            steps = value
        } else if let value = try container.decodeIfPresent(Double.self, forKey: .steps) {
            steps = Int(value)
        } else if let value = try container.decodeIfPresent(String.self, forKey: .steps),
                  let parsed = Int(value) {
            steps = parsed
        } else {
            steps = 1
        }
        let raw = try container.decodeIfPresent(String.self, forKey: .destination) ?? ""
        destination = raw.hasPrefix(".") ? String(raw.dropFirst()) : raw
    }

    private enum CodingKeys: String, CodingKey {
        case steps = "for"
        case destination = "to"
    }
}

@NShiftEvent(
    name: "BackNavigationEvent",
    version: "1.0.0",
    metadata: BackNavigationEventMetadata.self
)
struct BackNavigationEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let navigator = resolver.resolveUnwrapping(AppNavigator.self)
        let destination = metadata.destination
        let steps = metadata.steps
        await MainActor.run {
            if destination == "root" {
                navigator.popToRoot()
            } else if destination.isEmpty == false {
                navigator.pop(toScreen: destination)
            } else {
                navigator.pop(steps: steps)
            }
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
    let parameters: [String: String]

    init(
        screenName: String,
        parameters: [String: String] = [:]
    ) {
        self.screenName = screenName
        self.parameters = parameters
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        screenName = try container.decodeIfPresent(String.self, forKey: .screenName)
            ?? ""
        parameters = try container.decodeIfPresent(
            [String: String].self,
            forKey: .parameters
        ) ?? [:]
    }

    private enum CodingKeys: String, CodingKey {
        case screenName
        case parameters
    }
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
        guard await navigator.pushAsync(
            screenName: screenName,
            parameters: metadata.parameters
        ) else {
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
