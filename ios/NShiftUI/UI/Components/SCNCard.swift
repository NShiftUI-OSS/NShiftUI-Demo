import SwiftUI

struct SCNCard<Content: View>: View {
    @EnvironmentObject private var theme: SCNTheme
    private let action: (() -> Void)?
    private let content: () -> Content

    init(
        action: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.action = action
        self.content = content
    }

    var body: some View {
        Group {
            if let action {
                Button(action: action) {
                    card
                }
                .buttonStyle(.plain)
            } else {
                card
            }
        }
    }

    private var card: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s3
        ) {
            content()
        }
        .padding(theme.spacing.s4)
        .frame(
            maxWidth: .infinity,
            alignment: .leading
        )
        .background(theme.palette.card)
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.xl,
                style: .continuous
            )
                .stroke(
                    theme.palette.border,
                    lineWidth: theme.border.hairline
                )
        )
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.xl,
                style: .continuous
            )
        )
    }
}

#Preview {
    SCNComponentPreview {
        SCNCard {
            SCNText("SCNCard", weight: .medium)
            SCNText(
                "Content",
                color: .mutedForeground
            )
        }
    }
}
