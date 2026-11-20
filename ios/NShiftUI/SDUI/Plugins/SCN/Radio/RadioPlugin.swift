import NShiftUI
import SwiftUI

@NShiftMetadata
struct RadioMetadata: NShiftMetadata, Decodable {
    let title: String
    let isOn: Bool
}

@NShiftPlugin(
    name: "Radio",
    version: "1.0.0",
    metadata: RadioMetadata.self
)
struct RadioPlugin: NShiftPlugin {
    var body: some View {
        let title = metadata.title
        SCNRadio(
            title: title,
            isOn: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.isOn,
                write: { isOn in
                    RadioMetadata(
                        title: title,
                        isOn: isOn
                    )
                }
            )
        )
    }
}
