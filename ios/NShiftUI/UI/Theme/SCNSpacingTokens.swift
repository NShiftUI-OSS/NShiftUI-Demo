import SwiftUI

struct SCNSpacingTokens {
    let s0: CGFloat
    let s0_5: CGFloat
    let s1: CGFloat
    let s1_5: CGFloat
    let s2: CGFloat
    let s2_5: CGFloat
    let s3: CGFloat
    let s3_5: CGFloat
    let s4: CGFloat
    let s5: CGFloat
    let s6: CGFloat
    let s7: CGFloat
    let s8: CGFloat
    let s9: CGFloat
    let s10: CGFloat
    let s11: CGFloat
    let s12: CGFloat
    let s16: CGFloat

    static let standard = SCNSpacingTokens(
        unit: 4
    )

    private init(unit: CGFloat) {
        s0 = unit * 0
        s0_5 = unit * 0.5
        s1 = unit * 1
        s1_5 = unit * 1.5
        s2 = unit * 2
        s2_5 = unit * 2.5
        s3 = unit * 3
        s3_5 = unit * 3.5
        s4 = unit * 4
        s5 = unit * 5
        s6 = unit * 6
        s7 = unit * 7
        s8 = unit * 8
        s9 = unit * 9
        s10 = unit * 10
        s11 = unit * 11
        s12 = unit * 12
        s16 = unit * 16
    }
}
