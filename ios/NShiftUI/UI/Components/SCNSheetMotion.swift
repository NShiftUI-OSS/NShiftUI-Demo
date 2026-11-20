import SwiftUI
import UIKit

struct SCNSheetMotion {
    let animation: Animation
    let timing: UITimingCurveProvider
    let duration: TimeInterval

    init(
        animation: Animation,
        timing: UITimingCurveProvider,
        duration: TimeInterval
    ) {
        self.animation = animation
        self.timing = timing
        self.duration = duration
    }

    @MainActor
    static var standard: SCNSheetMotion {
        let tokens = SCNAnimationTokens.standard
        return SCNSheetMotion(
            animation: tokens(.out, .ms450),
            timing: tokens.timingParameters(.out, .ms450),
            duration: tokens.duration(.ms450)
        )
    }
}
