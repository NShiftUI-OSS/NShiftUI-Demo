import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "VerticalStack",
    version: "1.0.0"
)
struct VerticalStackPlugin: NShiftPlugin {
    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            children()
        }
    }
}
