import Foundation

struct SendHTTPRequestUseCase: SendHTTPRequestUseCaseProtocol {
    private let service: any SendHTTPRequestServiceProtocol

    init(service: any SendHTTPRequestServiceProtocol) {
        self.service = service
    }

    func execute(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse {
        try await service.send(request)
    }
}
