import SwiftUI

struct SCNSkeleton: View {
    @EnvironmentObject private var theme: SCNTheme
    @State private var isPulsing: Bool
    private let height: CGFloat?

    init(height: CGFloat? = nil) {
        self.height = height
        _isPulsing = State(initialValue: false)
    }

    var body: some View {
        RoundedRectangle(
            cornerRadius: theme.radius.md,
            style: .continuous
        )
            .fill(theme.palette.accent)
            .opacity(isPulsing ? theme.opacity.pressed : theme.opacity.opaque)
            .frame(maxWidth: .infinity)
            .frame(height: height ?? theme.spacing.s4)
            .animation(
                theme.animation(.linear, .ms500).repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear {
                isPulsing = true
            }
    }
}

#Preview {
    SCNComponentPreview {
        SCNSkeleton()
        SCNSkeleton(height: SCNTheme.shared.spacing.s10)
    }
}
