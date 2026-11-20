import NShiftUI
import SwiftUI

@NShiftMetadata
struct InputMetadata: NShiftMetadata, Decodable {
    let text: String
    let placeholder: String
    let isSecure: Bool
}

@NShiftPlugin(
    name: "Input",
    version: "1.0.0",
    metadata: InputMetadata.self
)
struct InputPlugin: NShiftPlugin {
    var body: some View {
        let placeholder = metadata.placeholder
        let isSecure = metadata.isSecure
        SCNInput(
            text: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.text,
                write: { text in
                    InputMetadata(
                        text: text,
                        placeholder: placeholder,
                        isSecure: isSecure
                    )
                }
            ),
            placeholder: placeholder,
            isSecure: isSecure
        )
    }
}
