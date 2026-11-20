import Foundation

protocol SendHTTPRequestUseCaseProtocol: Sendable {
    func execute(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse
}
