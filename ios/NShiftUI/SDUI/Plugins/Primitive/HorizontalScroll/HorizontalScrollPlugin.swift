import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "HorizontalScroll",
    version: "1.0.0"
)
struct HorizontalScrollPlugin: NShiftPlugin {
    var body: some View {
        ScrollView(.horizontal) {
            HStack(
                alignment: .top,
                spacing: 0
            ) {
                children()
            }
        }
    }
}
