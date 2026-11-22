import NShiftUI
import UIKit

@NShiftMetadata
struct CloseAppEventMetadata: NShiftMetadata, Decodable {
    init(from decoder: Decoder) throws {}
}

/// `CloseAppEvent()`: sends the app to the home screen and ends its process.
@NShiftEvent(
    name: "CloseAppEvent",
    version: "1.0.0",
    metadata: CloseAppEventMetadata.self
)
struct CloseAppEvent: NShiftEvent {
    func execute() async throws {
        await Self.close()
    }

    @MainActor
    private static func close() async {
        UIControl().sendAction(
            #selector(URLSessionTask.suspend),
            to: UIApplication.shared,
            for: nil
        )
        try? await Task.sleep(nanoseconds: 600_000_000)
        exit(0)
    }
}
