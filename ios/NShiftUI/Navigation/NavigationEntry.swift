import Foundation
import NShiftUI

struct NavigationEntry: Equatable, Identifiable, Sendable {
    let id: UUID
    let deeplink: Deeplink
    let preloadedModel: NShiftPluginModel?

    var screenName: String {
        deeplink.screenName
    }

    var parameters: [String: String] {
        deeplink.parameters
    }

    var screenURL: String {
        NShiftAppConfiguration.current.runtimeScreenURL(
            for: screenName,
            parameters: parameters
        )
    }

    init(
        id: UUID = UUID(),
        deeplink: Deeplink,
        preloadedModel: NShiftPluginModel? = nil
    ) {
        self.id = id
        self.deeplink = deeplink
        self.preloadedModel = preloadedModel
    }
}
