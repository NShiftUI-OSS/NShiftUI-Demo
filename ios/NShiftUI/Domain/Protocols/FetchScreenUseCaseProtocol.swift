import NShiftUI

protocol FetchScreenUseCaseProtocol: Sendable {
    func execute(url: String) async throws -> NShiftPluginModel
}
