import Foundation

final class SendHTTPRequestService: SendHTTPRequestServiceProtocol, @unchecked Sendable {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    func send(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse {
        let method = APIMethod(rawValue: request.method.uppercased()) ?? .get
        let body = request.body.isEmpty ? nil : Data(request.body.utf8)
        let raw = try await client.perform(
            method: method,
            path: request.path,
            headers: request.headers,
            query: request.query,
            body: body
        )
        return SendHTTPResponse(
            status: raw.status,
            body: raw.body
        )
    }
}
