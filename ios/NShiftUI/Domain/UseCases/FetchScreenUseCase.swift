import Foundation
import NShiftUI

struct FetchScreenUseCase: FetchScreenUseCaseProtocol {
    private let service: any ScreenServiceProtocol

    init(service: any ScreenServiceProtocol) {
        self.service = service
    }

    func execute(url: String) async throws -> NShiftPluginModel {
        let target = try urlTarget(from: url)
        let response = try await fetchScreen(target)
        let rainbow = try rainbowSource(from: response)
        return try screenModel(from: rainbow)
    }

    private func urlTarget(from url: String) throws -> ScreenURL {
        guard let target = ScreenURL(url) else {
            throw FetchScreenError.unavailable
        }
        return target
    }

    private func fetchScreen(_ target: ScreenURL) async throws -> ScreenResponse {
        let response: ScreenResponse
        do {
            response = try await service.fetch(
                ScreenRequest(
                    path: target.path,
                    query: target.query
                )
            )
        } catch {
            throw FetchScreenError.unavailable
        }
        guard (200..<300).contains(response.status) else {
            throw FetchScreenError.unavailable
        }
        return response
    }

    private func rainbowSource(from response: ScreenResponse) throws -> String {
        do {
            let data = Data(response.body.utf8)
            let runtime = try JSONDecoder().decode(RuntimeScreenResponse.self, from: data)
            return runtime.data.rainbow
        } catch {
            throw FetchScreenError.unavailable
        }
    }

    private func screenModel(from rainbow: String) throws -> NShiftPluginModel {
        let model: NShiftPluginModel
        do {
            model = try NShiftRainbowCompiler().compile(source: concreteBackNavigation(rainbow))
        } catch {
            throw FetchScreenError.unavailable
        }
        guard model.name.rawValue == "Screen" else {
            throw FetchScreenError.unavailable
        }
        return model
    }
}

private func concreteBackNavigation(_ source: String) -> String {
    source.replacingOccurrences(
        of: #"BackNavigationEvent\(\s*\)"#,
        with: "BackNavigationEvent(for: 1)",
        options: .regularExpression
    )
}
