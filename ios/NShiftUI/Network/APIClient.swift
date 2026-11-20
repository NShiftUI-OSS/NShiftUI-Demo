import Alamofire
import Foundation
import Security

final class APIClient: @unchecked Sendable {
    private let baseURL: String
    private let session: Session
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(
        baseURL: String,
        session: Session? = nil,
        trustLocalCertificate: Bool = false
    ) {
        self.baseURL = baseURL
        self.session = session ?? Self.makeSession(
            baseURL: baseURL,
            trustLocalCertificate: trustLocalCertificate
        )
    }

    func send<Request: APIRequest>(
        _ request: Request
    ) async throws(APIError) -> Request.Response {
        let url = try url(for: request)
        let httpBody = try encodedBody(for: request)
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = request.method.rawValue
        urlRequest.timeoutInterval = request.timeout
        urlRequest.httpBody = httpBody
        var headers = HTTPHeaders(request.headers)
        if headers["Content-Type"] == nil {
            headers.add(.contentType("application/json"))
        }
        headers.forEach { header in
            urlRequest.setValue(
                header.value,
                forHTTPHeaderField: header.name
            )
        }

        let response = await session
            .request(urlRequest)
            .serializingData()
            .response

        if Task.isCancelled {
            throw APIError.cancelled
        }
        if let error = response.error {
            throw mapped(error)
        }
        guard let status = response.response?.statusCode else {
            throw APIError.transport(message: "Missing HTTP status.")
        }
        let payload = response.data ?? Data()
        guard (200..<300).contains(status) else {
            throw APIError.http(status: status, body: payload)
        }
        do {
            return try decoder.decode(Request.Response.self, from: payload)
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decoding(message: String(describing: error))
        }
    }

    func perform(
        method: APIMethod,
        path: String,
        headers: [String: String],
        query: [String: String],
        body: Data?
    ) async throws(APIError) -> APIRawResponse {
        let request = RawAPIRequest(
            path: path,
            method: method,
            headers: headers,
            query: query
        )
        let url = try url(for: request)
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method.rawValue
        urlRequest.timeoutInterval = request.timeout
        urlRequest.httpBody = body
        var httpHeaders = HTTPHeaders(headers)
        if httpHeaders["Content-Type"] == nil {
            httpHeaders.add(.contentType("application/json"))
        }
        httpHeaders.forEach { header in
            urlRequest.setValue(
                header.value,
                forHTTPHeaderField: header.name
            )
        }
        let response = await session
            .request(urlRequest)
            .serializingData()
            .response
        if Task.isCancelled {
            throw APIError.cancelled
        }
        if let error = response.error {
            throw mapped(error)
        }
        guard let status = response.response?.statusCode else {
            throw APIError.transport(message: "Missing HTTP status.")
        }
        return APIRawResponse(
            status: status,
            body: response.data ?? Data()
        )
    }

    private func url<Request: APIRequest>(
        for request: Request
    ) throws(APIError) -> URL {
        guard !baseURL.isEmpty,
              var components = URLComponents(string: baseURL) else {
            throw APIError.invalidURL
        }
        let relative = request.path.hasPrefix("/") ? String(request.path.dropFirst()) : request.path
        let basePath = components.path.hasSuffix("/") ? String(components.path.dropLast()) : components.path
        components.path = relative.isEmpty ? basePath : basePath + "/" + relative
        if !request.query.isEmpty {
            components.queryItems = request.query.map { name, value in
                URLQueryItem(name: name, value: value)
            }
        }
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        return url
    }

    private func encodedBody<Request: APIRequest>(
        for request: Request
    ) throws(APIError) -> Data? {
        guard let body = request.body else {
            return nil
        }
        do {
            return try encoder.encode(AnyAPIBody(body))
        } catch {
            throw APIError.decoding(message: String(describing: error))
        }
    }

    private func mapped(_ error: AFError) -> APIError {
        if error.isExplicitlyCancelledError {
            return .cancelled
        }
        if case .sessionTaskFailed(let underlying) = error,
           let urlError = underlying as? URLError,
           urlError.code == .cancelled {
            return .cancelled
        }
        return .transport(message: error.localizedDescription)
    }

    private static func makeSession(
        baseURL: String,
        trustLocalCertificate: Bool
    ) -> Session {
        let certificate = localCertificate()
        guard trustLocalCertificate,
              baseURL.hasPrefix("https://127.0.0.1"),
              let certificate
        else {
            return Session()
        }

        let evaluator = LocalCertificateTrustEvaluator(certificate: certificate)
        return Session(
            serverTrustManager: ServerTrustManager(
                evaluators: ["127.0.0.1": evaluator]
            )
        )
    }

    private static func localCertificate() -> SecCertificate? {
        guard let url = Bundle.main.url(
            forResource: "nshift-local-ca",
            withExtension: "crt"
        ),
        let pem = try? String(contentsOf: url, encoding: .utf8),
        let data = Data(
            base64Encoded: pem
                .components(separatedBy: .newlines)
                .filter {
                    !$0.hasPrefix("-----BEGIN") &&
                    !$0.hasPrefix("-----END") &&
                    !$0.isEmpty
                }
                .joined()
        )
        else {
            return nil
        }
        return SecCertificateCreateWithData(nil, data as CFData)
    }
}

private final class LocalCertificateTrustEvaluator: ServerTrustEvaluating {
    private let certificate: SecCertificate

    init(certificate: SecCertificate) {
        self.certificate = certificate
    }

    func evaluate(_ trust: SecTrust, forHost host: String) throws {
        try trust.af.setAnchorCertificates([certificate])
        try trust.af.performValidation(forHost: host)
    }
}

struct APIRawResponse: Sendable {
    let status: Int
    let body: Data
}

private struct RawAPIRequest: APIRequest {
    typealias Response = Data
    let path: String
    let method: APIMethod
    let headers: [String: String]
    let query: [String: String]
}

private struct AnyAPIBody: Encodable {
    private let encodeBody: (Encoder) throws -> Void

    init(_ body: any Encodable) {
        encodeBody = { encoder in
            try body.encode(to: encoder)
        }
    }

    func encode(to encoder: Encoder) throws {
        try encodeBody(encoder)
    }
}
