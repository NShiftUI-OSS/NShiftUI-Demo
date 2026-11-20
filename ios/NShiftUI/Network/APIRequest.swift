import Foundation

protocol APIRequest<Response>: Sendable {
    associatedtype Response: Decodable & Sendable
    var path: String { get }
    var method: APIMethod { get }
    var headers: [String: String] { get }
    var query: [String: String] { get }
    var body: (any Encodable & Sendable)? { get }
    var timeout: TimeInterval { get }
}

extension APIRequest {
    var method: APIMethod { .get }
    var headers: [String: String] { [:] }
    var query: [String: String] { [:] }
    var body: (any Encodable & Sendable)? { nil }
    var timeout: TimeInterval { 30 }
}

struct APIStatusRequest: APIRequest {
    let path = "status"

    struct Response: Decodable, Sendable {
        let ok: Bool
    }
}
