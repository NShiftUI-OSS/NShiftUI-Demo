import Foundation

final class ScreenService: ScreenServiceProtocol, @unchecked Sendable {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    func fetch(
        _ request: ScreenRequest
    ) async throws -> ScreenResponse {
        let raw = try await client.perform(
            method: .get,
            path: request.path,
            headers: [:],
            query: request.query,
            body: nil
        )
        let body = String(
            data: raw.body,
            encoding: .utf8
        ) ?? ""
        return ScreenResponse(
            status: raw.status,
            body: body
        )
    }
}
