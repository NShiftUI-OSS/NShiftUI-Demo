import SwiftUI

struct SCNOpacityTokens {
    let opaque: Double
    let disabled: Double
    let pressed: Double
    let subtle: Double
    let field: Double

    static let standard = SCNOpacityTokens(
        opaque: 1,
        disabled: 0.5,
        pressed: 0.8,
        subtle: 0.1,
        field: 0.3
    )
}
