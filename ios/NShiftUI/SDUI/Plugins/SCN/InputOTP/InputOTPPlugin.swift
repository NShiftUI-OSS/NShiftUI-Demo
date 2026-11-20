import NShiftUI
import SwiftUI

@NShiftMetadata
struct InputOTPMetadata: NShiftMetadata, Decodable {
    let length: Int
    let code: String
}

@NShiftPlugin(
    name: "InputOTP",
    version: "1.0.0",
    metadata: InputOTPMetadata.self
)
struct InputOTPPlugin: NShiftPlugin {
    var body: some View {
        let length = metadata.length
        SCNInputOTP(
            length: length,
            code: Binding(
                get: { metadata.code },
                set: { code in
                    storeThenFire(
                        .onChange,
                        engine: engine,
                        renderID: renderID,
                        metadata: InputOTPMetadata(
                            length: length,
                            code: code
                        )
                    )
                    if code.count == length {
                        fire(
                            .onComplete,
                            engine: engine,
                            renderID: renderID
                        )
                    }
                }
            )
        )
    }
}
