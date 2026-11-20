import Foundation

protocol SendHTTPRequestServiceProtocol: Sendable {
    func send(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse
}
