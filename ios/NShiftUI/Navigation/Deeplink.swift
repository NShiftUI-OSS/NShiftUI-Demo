import Foundation

struct Deeplink: Equatable, Hashable, Sendable {
    let screenName: String
    let parameters: [String: String]
    let raw: String

    static let home = "nshift://screen/home"

    static func parse(_ text: String) -> Deeplink? {
        guard let components = URLComponents(string: text),
              components.scheme == "nshift",
              components.host == "screen" else {
            return nil
        }
        let segments = components.path
            .split(separator: "/")
            .map(String.init)
            .filter { $0.isEmpty == false }
        guard segments.count == 1,
              let screenName = segments.first,
              screenName.isEmpty == false else {
            return nil
        }
        var parameters: [String: String] = [:]
        for item in components.queryItems ?? [] {
            if parameters[item.name] == nil {
                parameters[item.name] = item.value ?? ""
            }
        }
        return Deeplink(
            screenName: screenName,
            parameters: parameters,
            raw: text
        )
    }
}
