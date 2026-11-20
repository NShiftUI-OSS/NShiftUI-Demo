import NShiftUI
import SwiftUI

@NShiftMetadata
struct ButtonGroupMetadata: NShiftMetadata, Decodable {
    let titles: [String]
    let selection: String
}

@NShiftPlugin(
    name: "ButtonGroup",
    version: "1.0.0",
    metadata: ButtonGroupMetadata.self
)
struct ButtonGroupPlugin: NShiftPlugin {
    var body: some View {
        let titles = metadata.titles
        SCNButtonGroup(titles: titles) { title in
            storeThenFire(
                .onSelect,
                engine: engine,
                renderID: renderID,
                metadata: ButtonGroupMetadata(
                    titles: titles,
                    selection: title
                )
            )
        }
    }
}
