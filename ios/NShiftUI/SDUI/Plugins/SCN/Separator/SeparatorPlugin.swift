import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "Separator",
    version: "1.0.0"
)
struct SeparatorPlugin: NShiftPlugin {
    var body: some View {
        SCNSeparator()
    }
}
