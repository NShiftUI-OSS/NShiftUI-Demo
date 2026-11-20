import NShiftUI
import SwiftUI

@NShiftMetadata
struct SelectMetadata: NShiftMetadata, Decodable {
    let options: [String]
    let selection: String
}

@NShiftPlugin(
    name: "Select",
    version: "1.0.0",
    metadata: SelectMetadata.self
)
struct SelectPlugin: NShiftPlugin {
    var body: some View {
        let options = metadata.options
        SCNSelect(
            options: options,
            selection: nshiftBinding(
                .onSelect,
                engine: engine,
                renderID: renderID,
                value: metadata.selection,
                write: { selection in
                    SelectMetadata(
                        options: options,
                        selection: selection
                    )
                }
            )
        )
    }
}
