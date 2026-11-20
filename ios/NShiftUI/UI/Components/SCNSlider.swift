import SwiftUI

struct SCNSlider: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var value: Double
    @State private var dragOrigin: Double?

    init(value: Binding<Double>) {
        _value = value
    }

    var body: some View {
        GeometryReader { proxy in
            let width = proxy.size.width
            let thumb = theme.spacing.s4
            let travel = max(width - thumb, 0)
            let position = travel * clamped
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(theme.palette.muted)
                    .frame(height: theme.spacing.s1_5)
                Capsule()
                    .fill(theme.palette.primary)
                    .frame(
                        width: position + thumb / 2,
                        height: theme.spacing.s1_5
                    )
                Circle()
                    .fill(Color.white)
                    .overlay(
                        Circle()
                            .strokeBorder(
                                theme.palette.primary,
                                lineWidth: theme.border.hairline
                            )
                    )
                    .frame(
                        width: thumb,
                        height: thumb
                    )
                    .shadow(
                        color: theme.palette.foreground.opacity(theme.opacity.subtle),
                        radius: theme.spacing.s0_5,
                        y: theme.spacing.s0_5
                    )
                    .offset(x: position)
            }
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity,
                alignment: .leading
            )
            .contentShape(Rectangle())
            .highPriorityGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { gesture in
                        follow(
                            gesture,
                            travel: travel
                        )
                    }
                    .onEnded { gesture in
                        finish(
                            gesture,
                            travel: travel
                        )
                    }
            )
        }
        .frame(height: theme.spacing.s4)
        .accessibilityElement()
        .accessibilityLabel("Slider")
        .accessibilityValue("\(Int(value * 100))")
    }

    private var clamped: Double {
        min(
            max(value, 0),
            1
        )
    }

    private func follow(
        _ gesture: DragGesture.Value,
        travel: CGFloat
    ) {
        guard travel > 0 else {
            return
        }
        if dragOrigin == nil {
            dragOrigin = clamped
        }
        let origin = (dragOrigin ?? clamped) * travel
        let next = (origin + gesture.translation.width) / travel
        var transaction = Transaction()
        transaction.disablesAnimations = true
        withTransaction(transaction) {
            value = min(
                max(next, 0),
                1
            )
        }
    }

    private func finish(
        _ gesture: DragGesture.Value,
        travel: CGFloat
    ) {
        let tapped = abs(gesture.translation.width) < theme.spacing.s1
            && abs(gesture.translation.height) < theme.spacing.s1
        dragOrigin = nil
        guard tapped, travel > 0 else {
            return
        }
        let next = (gesture.location.x - theme.spacing.s4 / 2) / travel
        withAnimation(theme.animation(.soft, .ms150)) {
            value = min(
                max(next, 0),
                1
            )
        }
    }
}

struct SCNSliderPreview: View {
    @State private var low = 0.2
    @State private var high = 0.8

    var body: some View {
        SCNComponentPreview {
            SCNSlider(value: $low)
            SCNSlider(value: $high)
        }
    }
}

#Preview {
    SCNSliderPreview()
}
