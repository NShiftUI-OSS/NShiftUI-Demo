import Foundation

enum APIError: Error, Sendable {
    case invalidURL
    case transport(message: String)
    case http(status: Int, body: Data)
    case decoding(message: String)
    case cancelled
}
