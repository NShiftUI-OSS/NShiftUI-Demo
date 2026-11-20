import Foundation

protocol ScreenServiceProtocol: Sendable {
    func fetch(
        _ request: ScreenRequest
    ) async throws -> ScreenResponse
}
