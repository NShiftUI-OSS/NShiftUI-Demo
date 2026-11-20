import SwiftUI

struct SCNSpinner: View {
    @EnvironmentObject private var theme: SCNTheme
    @State private var spinning = false

    var body: some View {
        SCNIcon(
            .loaderCircle,
            size: theme.spacing.s4,
            color: theme.palette.foreground
        )
        .rotationEffect(.degrees(spinning ? 360 : 0))
        .onAppear {
            withAnimation(
                .linear(duration: 1)
                    .repeatForever(autoreverses: false)
            ) {
                spinning = true
            }
        }
        .accessibilityLabel("Loading")
    }
}

#Preview {
    SCNComponentPreview {
        SCNSpinner()
    }
}
