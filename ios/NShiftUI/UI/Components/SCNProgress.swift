import SwiftUI

struct SCNProgress: View {
    @EnvironmentObject private var theme: SCNTheme
    private let value: Double

    init(value: Double) {
        self.value = value
    }

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .leading) {
                Capsule().fill(
                    theme.palette.primary.opacity(0.2)
                )
                Capsule()
                    .fill(theme.palette.primary)
                    .frame(
                        width: proxy.size.width * CGFloat(
                            min(
                                max(
                                    value,
                                    theme.opacity.opaque - theme.opacity.opaque
                                ),
                                theme.opacity.opaque
                            )
                        )
                    )
            }
        }
        .frame(height: theme.spacing.s2)
    }
}

#Preview {
    SCNComponentPreview {
        SCNProgress(value: 0.25)
        SCNProgress(value: 0.6)
        SCNProgress(value: 1)
    }
}
