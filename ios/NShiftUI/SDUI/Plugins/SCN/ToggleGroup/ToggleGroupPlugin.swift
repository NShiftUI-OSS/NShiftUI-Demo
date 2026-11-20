import NShiftUI
import SwiftUI

@NShiftMetadata
struct ToggleGroupMetadata: NShiftMetadata, Decodable {
    let options: [String]
    let selection: String
}

@NShiftPlugin(
    name: "ToggleGroup",
    version: "1.0.0",
    metadata: ToggleGroupMetadata.self
)
struct ToggleGroupPlugin: NShiftPlugin {
    var body: some View {
        let options = metadata.options
        SCNToggleGroup(
            options: options,
            selection: nshiftBinding(
                .onSelect,
                engine: engine,
                renderID: renderID,
                value: metadata.selection,
                write: { selection in
                    ToggleGroupMetadata(
                        options: options,
                        selection: selection
                    )
                }
            )
        )
    }
}
