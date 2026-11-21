import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "HorizontalStack",
    version: "1.0.0",
    metadata: StackLayoutMetadata.self
)
struct HorizontalStackPlugin: NShiftPlugin {
    var body: some View {
        HStack(
            alignment: metadata.verticalAlignment(),
            spacing: metadata.spacing
        ) {
            children()
        }
    }
}
