import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "LayerStack",
    version: "1.0.0",
    metadata: StackLayoutMetadata.self
)
struct LayerStackPlugin: NShiftPlugin {
    var body: some View {
        ZStack(
            alignment: metadata.layerAlignment()
        ) {
            children()
        }
    }
}
