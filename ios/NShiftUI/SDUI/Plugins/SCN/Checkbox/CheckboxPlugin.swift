import NShiftUI
import SwiftUI

@NShiftMetadata
struct CheckboxMetadata: NShiftMetadata, Decodable {
    let title: String
    let isOn: Bool
}

@NShiftPlugin(
    name: "Checkbox",
    version: "1.0.0",
    metadata: CheckboxMetadata.self
)
struct CheckboxPlugin: NShiftPlugin {
    var body: some View {
        let title = metadata.title
        SCNCheckbox(
            title: title,
            isOn: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.isOn,
                write: { isOn in
                    CheckboxMetadata(
                        title: title,
                        isOn: isOn
                    )
                }
            )
        )
    }
}
