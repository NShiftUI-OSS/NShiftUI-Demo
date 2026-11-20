import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "HorizontalList",
    version: "1.0.0"
)
struct HorizontalListPlugin: NShiftPlugin {
    var body: some View {
        ScrollView(.horizontal) {
            LazyHStack(
                alignment: .top,
                spacing: 0
            ) {
                children()
            }
        }
    }
}
