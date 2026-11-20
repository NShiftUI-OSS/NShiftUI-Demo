import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "LayerStack",
    version: "1.0.0"
)
struct LayerStackPlugin: NShiftPlugin {
    var body: some View {
        ZStack(
            alignment: .topLeading
        ) {
            children()
        }
    }
}
