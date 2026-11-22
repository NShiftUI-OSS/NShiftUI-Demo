import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "Card",
    version: "1.0.0"
)
struct CardPlugin: NShiftPlugin {
    var body: some View {
        SCNCard(action: {
            fire(
                .onTap,
                engine: engine,
                renderID: renderID
            )
        }) {
            children()
        }
    }
}
