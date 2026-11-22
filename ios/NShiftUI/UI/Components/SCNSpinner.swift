import SwiftUI

struct SCNSpinner: View {
    @EnvironmentObject private var theme: SCNTheme

    /// The angle is derived from the clock instead of a repeating
    /// `withAnimation`: a repeating animation started on appear leaks into
    /// every layout change of the same transaction (for example the
    /// navigation bar buttons of a screen being presented), which then drift.
    var body: some View {
        TimelineView(.animation) { context in
            let seconds = context.date.timeIntervalSinceReferenceDate
            SCNIcon(
                .loaderCircle,
                size: theme.spacing.s4,
                color: theme.palette.foreground
            )
            .rotationEffect(.degrees(seconds.truncatingRemainder(dividingBy: 1) * 360))
        }
        .accessibilityLabel("Loading")
    }
}

#Preview {
    SCNComponentPreview {
        SCNSpinner()
    }
}
