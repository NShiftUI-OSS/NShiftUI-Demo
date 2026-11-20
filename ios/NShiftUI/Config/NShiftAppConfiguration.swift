import Foundation

enum NShiftAppEnvironment: String, CaseIterable, Sendable {
    case prd = "PRD"
    case dev = "DEV"
    case local = "LOCAL"

    var backendBaseURL: String {
        // DEV and PRD intentionally point to the local backend until their
        // environments are provisioned.
        switch self {
        case .prd, .dev, .local:
            return "https://127.0.0.1:3000"
        }
    }
}

struct NShiftAppConfiguration: Sendable {
    let environment: NShiftAppEnvironment
    let backendBaseURL: String
    let initialScreenName: String

    static let current = NShiftAppConfiguration(environment: .local)

    init(
        environment: NShiftAppEnvironment,
        initialScreenName: String = "home"
    ) {
        self.environment = environment
        self.backendBaseURL = environment.backendBaseURL
        self.initialScreenName = initialScreenName
    }

    var initialScreenURL: String {
        runtimeScreenURL(for: initialScreenName)
    }

    func runtimeScreenURL(
        for screenName: String,
        parameters: [String: String] = [:]
    ) -> String {
        let encodedName = screenName.addingPercentEncoding(
            withAllowedCharacters: .urlPathAllowed
        ) ?? screenName
        guard parameters.isEmpty == false else {
            return "/runtime/screens/\(encodedName)"
        }
        let query = parameters
            .sorted { $0.key < $1.key }
            .map { key, value in
                "\(encode(key))=\(encode(value))"
            }
            .joined(separator: "&")
        return "/runtime/screens/\(encodedName)?\(query)"
    }

    private func encode(_ value: String) -> String {
        value.addingPercentEncoding(
            withAllowedCharacters: .urlQueryAllowed
        ) ?? value
    }
}
