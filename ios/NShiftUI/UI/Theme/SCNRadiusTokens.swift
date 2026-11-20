import SwiftUI

struct SCNRadiusTokens {
    let sm: CGFloat
    let md: CGFloat
    let lg: CGFloat
    let xl: CGFloat
    let xl2: CGFloat
    let xl3: CGFloat
    let xl4: CGFloat
    let controlXs: CGFloat
    let controlSm: CGFloat

    static let standard = SCNRadiusTokens(
        base: 10,
        capXs: SCNSpacingTokens.standard.s2,
        capSm: SCNSpacingTokens.standard.s2_5
    )

    private init(
        base: CGFloat,
        capXs: CGFloat,
        capSm: CGFloat
    ) {
        sm = base * 0.6
        md = base * 0.8
        lg = base
        xl = base * 1.4
        xl2 = base * 1.8
        xl3 = base * 2.2
        xl4 = base * 2.6
        controlXs = min(
            md,
            capXs
        )
        controlSm = min(
            md,
            capSm
        )
    }
}
