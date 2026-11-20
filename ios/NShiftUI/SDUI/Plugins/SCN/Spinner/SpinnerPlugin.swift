import NShiftUI
import SwiftUI

@NShiftPlugin(
    name: "Spinner",
    version: "1.0.0"
)
struct SpinnerPlugin: NShiftPlugin {
    var body: some View {
        SCNSpinner()
    }
}
