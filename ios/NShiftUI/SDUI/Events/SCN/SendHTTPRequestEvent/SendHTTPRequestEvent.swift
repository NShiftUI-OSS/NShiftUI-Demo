import Foundation
import NShiftUI

@NShiftMetadata
struct SendHTTPRequestEventMetadata: NShiftMetadata, NShiftJSONTaggedMetadata, Decodable {
    static let jsonTaggedParameters: Set<String> = ["body"]

    let method: String
    let path: String
    let headers: [String: String]
    let query: [String: String]
    let body: String

    private enum CodingKeys: String, CodingKey {
        case method
        case path
        case headers
        case query
        case body
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        method = try container.decodeIfPresent(String.self, forKey: .method) ?? "GET"
        path = try container.decodeIfPresent(String.self, forKey: .path) ?? ""
        headers = try container.decodeIfPresent([String: String].self, forKey: .headers) ?? [:]
        query = try container.decodeIfPresent([String: String].self, forKey: .query) ?? [:]
        body = try container.decodeIfPresent(String.self, forKey: .body) ?? ""
    }
}

@NShiftEvent(
    name: "SendHTTPRequestEvent",
    version: "1.0.0",
    metadata: SendHTTPRequestEventMetadata.self
)
struct SendHTTPRequestEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let http = await ScreenViewModel.resolve(engine: engine, fallback: viewModel)
        guard let http else {
            await dispatch(
                .onFailure,
                events: nested,
                handler: handler,
                viewModel: viewModel
            )
            return
        }
        let response: SendHTTPResponse
        do {
            response = try await http.sendHTTPRequest(
                SendHTTPRequest(
                    method: metadata.method,
                    path: metadata.path,
                    headers: metadata.headers,
                    query: metadata.query,
                    body: metadata.body
                )
            )
        } catch {
            await dispatch(
                .onFailure,
                events: nested,
                handler: handler,
                viewModel: viewModel
            )
            return
        }
        if let statusTrigger = NShiftTrigger.onStatusCode(response.status) {
            await dispatch(
                statusTrigger,
                events: nested,
                handler: handler,
                viewModel: viewModel
            )
        }
        if (200..<300).contains(response.status) {
            await dispatch(
                .onComplete,
                events: nested,
                handler: handler,
                viewModel: viewModel
            )
        }
    }
}
