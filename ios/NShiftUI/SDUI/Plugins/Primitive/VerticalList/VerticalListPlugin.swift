import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "VerticalList",
    version: "1.0.0"
)
struct VerticalListPlugin: NShiftPlugin {
    var body: some View {
        ScrollView {
            LazyVStack(
                alignment: .leading,
                spacing: 0
            ) {
                children()
            }
        }
    }
}
