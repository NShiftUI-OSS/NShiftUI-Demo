import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "HorizontalStack",
    version: "1.0.0"
)
struct HorizontalStackPlugin: NShiftPlugin {
    var body: some View {
        HStack(
            alignment: .top,
            spacing: 0
        ) {
            children()
        }
    }
}
