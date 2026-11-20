import NShiftUI
import SwiftUI

@NShiftMetadata
struct AlertMetadata: NShiftMetadata, Decodable {
    let title: String
    let message: String?
    let variant: String

    func scnVariant() -> SCNAlert.Variant {
        variant == "destructive" ? .destructive : .default
    }
}

@NShiftPlugin(
    name: "Alert",
    version: "1.0.0",
    metadata: AlertMetadata.self
)
struct AlertPlugin: NShiftPlugin {
    var body: some View {
        SCNAlert(
            title: metadata.title,
            message: metadata.message,
            variant: metadata.scnVariant()
        )
    }
}
