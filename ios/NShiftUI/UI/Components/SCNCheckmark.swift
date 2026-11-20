import SwiftUI

struct SCNCheckmark: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(
            to: CGPoint(
                x: rect.minX + rect.width * 0.167,
                y: rect.midY
            )
        )
        path.addLine(
            to: CGPoint(
                x: rect.minX + rect.width * 0.375,
                y: rect.minY + rect.height * 0.708
            )
        )
        path.addLine(
            to: CGPoint(
                x: rect.minX + rect.width * 0.833,
                y: rect.minY + rect.height * 0.25
            )
        )
        return path
    }
}
