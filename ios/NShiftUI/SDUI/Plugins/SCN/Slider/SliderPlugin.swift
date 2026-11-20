import NShiftUI
import SwiftUI

@NShiftMetadata
struct SliderMetadata: NShiftMetadata, Decodable {
    let value: Double
}

@NShiftPlugin(
    name: "Slider",
    version: "1.0.0",
    metadata: SliderMetadata.self
)
struct SliderPlugin: NShiftPlugin {
    var body: some View {
        SCNSlider(
            value: nshiftBinding(
                .onChange,
                engine: engine,
                renderID: renderID,
                value: metadata.value,
                write: { value in
                    SliderMetadata(value: value)
                }
            )
        )
    }
}
