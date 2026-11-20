import Foundation

struct ScreenRequest: Equatable, Sendable {
    let path: String
    let query: [String: String]
}
