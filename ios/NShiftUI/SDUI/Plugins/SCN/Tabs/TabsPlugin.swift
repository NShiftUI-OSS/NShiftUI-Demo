import NShiftUI
import SwiftUI

@NShiftMetadata
struct TabsMetadata: NShiftMetadata, Decodable {
    let titles: [String]
    let selection: String
}

@NShiftPlugin(
    name: "Tabs",
    version: "1.0.0",
    metadata: TabsMetadata.self
)
struct TabsPlugin: NShiftPlugin {
    var body: some View {
        let titles = metadata.titles
        SCNTabs(
            titles: titles,
            selection: nshiftBinding(
                .onSelect,
                engine: engine,
                renderID: renderID,
                value: metadata.selection,
                write: { selection in
                    TabsMetadata(
                        titles: titles,
                        selection: selection
                    )
                }
            )
        )
    }
}
