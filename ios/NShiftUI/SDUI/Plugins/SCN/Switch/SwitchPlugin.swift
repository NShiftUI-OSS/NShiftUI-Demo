import NShiftUI
import SwiftUI

@NShiftMetadata
struct SwitchMetadata: NShiftMetadata, Decodable {
    let isOn: Bool
}

@NShiftPlugin(
    name: "Switch",
    version: "1.0.0",
    metadata: SwitchMetadata.self
)
struct SwitchPlugin: NShiftPlugin {
    var body: some View {
        SCNSwitch(
            isOn: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.isOn,
                write: { isOn in
                    SwitchMetadata(isOn: isOn)
                }
            )
        )
    }
}
