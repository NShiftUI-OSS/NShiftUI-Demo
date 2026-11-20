import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "VerticalScroll",
    version: "1.0.0"
)
struct VerticalScrollPlugin: NShiftPlugin {
    var body: some View {
        ScrollView {
            VStack(
                alignment: .leading,
                spacing: 0
            ) {
                children()
            }
        }
    }
}
