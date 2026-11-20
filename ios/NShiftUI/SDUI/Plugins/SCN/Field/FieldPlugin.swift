import NShiftUI
import SwiftUI

@NShiftMetadata
struct FieldMetadata: NShiftMetadata, Decodable {
    let label: String
    let hint: String?
}

@NShiftPlugin(
    name: "Field",
    version: "1.0.0",
    metadata: FieldMetadata.self
)
struct FieldPlugin: NShiftPlugin {
    var body: some View {
        SCNField(
            label: metadata.label,
            hint: metadata.hint
        ) {
            children()
        }
    }
}
