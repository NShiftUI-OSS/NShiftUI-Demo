import NShiftUI
import SwiftUI

@NShiftMetadata
struct ProgressMetadata: NShiftMetadata, Decodable {
    let value: Double
}

@NShiftPlugin(
    name: "Progress",
    version: "1.0.0",
    metadata: ProgressMetadata.self
)
struct ProgressPlugin: NShiftPlugin {
    var body: some View {
        SCNProgress(value: metadata.value)
    }
}
