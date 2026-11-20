import SwiftUI
import UIKit

struct SCNAnimationTokens {
    enum Curve {
        case linear
        case inOut
        case out
        case drawer
        case overshoot
        case enter
        case exit
        case soft
    }

    enum Duration {
        case ms100
        case ms150
        case ms200
        case ms300
        case ms450
        case ms500
    }

    static let standard = SCNAnimationTokens()

    private init() {}

    func callAsFunction(
        _ curve: Curve,
        _ duration: Duration
    ) -> Animation {
        let control = points(curve)
        return Animation.timingCurve(
            control.x1,
            control.y1,
            control.x2,
            control.y2,
            duration: seconds(duration)
        )
    }

    func duration(_ duration: Duration) -> TimeInterval {
        seconds(duration)
    }

    @MainActor
    func timingParameters(
        _ curve: Curve,
        _ duration: Duration
    ) -> UICubicTimingParameters {
        let control = points(curve)
        return UICubicTimingParameters(
            controlPoint1: CGPoint(
                x: control.x1,
                y: control.y1
            ),
            controlPoint2: CGPoint(
                x: control.x2,
                y: control.y2
            )
        )
    }

    private func seconds(_ duration: Duration) -> TimeInterval {
        switch duration {
        case .ms100:
            return 0.1
        case .ms150:
            return 0.15
        case .ms200:
            return 0.2
        case .ms300:
            return 0.3
        case .ms450:
            return 0.45
        case .ms500:
            return 0.5
        }
    }

    private func points(_ curve: Curve) -> Control {
        switch curve {
        case .linear:
            return Control(x1: 0, y1: 0, x2: 1, y2: 1)
        case .inOut:
            return Control(x1: 0.42, y1: 0, x2: 0.58, y2: 1)
        case .out:
            return Control(x1: 0.22, y1: 1, x2: 0.36, y2: 1)
        case .drawer:
            return Control(x1: 0.32, y1: 0.72, x2: 0, y2: 1)
        case .overshoot:
            return Control(x1: 0.45, y1: 1.005, x2: 0, y2: 1.005)
        case .enter:
            return Control(x1: 0.23, y1: 1, x2: 0.32, y2: 1)
        case .exit:
            return Control(x1: 0.7, y1: 0, x2: 0.84, y2: 0)
        case .soft:
            return Control(x1: 0.16, y1: 1, x2: 0.3, y2: 1)
        }
    }
}

extension SCNAnimationTokens {
    private struct Control {
        let x1: Double
        let y1: Double
        let x2: Double
        let y2: Double

        init(
            x1: Double,
            y1: Double,
            x2: Double,
            y2: Double
        ) {
            self.x1 = x1
            self.y1 = y1
            self.x2 = x2
            self.y2 = y2
        }
    }
}
