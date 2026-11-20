import NShiftUI
import SwiftUI

@NShiftMetadata
struct TextareaMetadata: NShiftMetadata, Decodable {
    let text: String
    let placeholder: String
}

@NShiftPlugin(
    name: "Textarea",
    version: "1.0.0",
    metadata: TextareaMetadata.self
)
struct TextareaPlugin: NShiftPlugin {
    var body: some View {
        let placeholder = metadata.placeholder
        SCNTextarea(
            text: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.text,
                write: { text in
                    TextareaMetadata(
                        text: text,
                        placeholder: placeholder
                    )
                }
            ),
            placeholder: placeholder
        )
    }
}
