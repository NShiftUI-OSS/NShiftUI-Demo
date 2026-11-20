import Foundation

struct SendHTTPRequest: Equatable, Sendable {
    let method: String
    let path: String
    let headers: [String: String]
    let query: [String: String]
    let body: String
}
