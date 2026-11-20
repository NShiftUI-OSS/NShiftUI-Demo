import Foundation

struct SendHTTPResponse: Equatable, Sendable {
    let status: Int
    let body: Data
}
