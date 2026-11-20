import SwiftUI

struct SCNAlert: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Variant {
        case `default`
        case destructive
    }

    private let title: String
    private let message: String?
    private let variant: Variant

    private var titleColor: SCNText.Color {
        variant == .destructive ? .destructive : .foreground
    }

    private var border: Color {
        variant == .destructive ? theme.palette.destructive : theme.palette.border
    }

    init(
        title: String,
        message: String? = nil,
        variant: Variant = .default
    ) {
        self.title = title
        self.message = message
        self.variant = variant
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s1
        ) {
            SCNText(
                title,
                weight: .medium,
                color: titleColor
            )
            if let message {
                SCNText(
                    message,
                    color: .mutedForeground
                )
            }
        }
        .padding(theme.spacing.s4)
        .frame(
            maxWidth: .infinity,
            alignment: .leading
        )
        .background(theme.palette.card)
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
                .stroke(
                    border,
                    lineWidth: theme.border.hairline
                )
        )
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
        )
    }
}

#Preview {
    SCNComponentPreview {
        SCNAlert(
            title: "Warning",
            message: "Something needs your review."
        )
        SCNAlert(
            title: "Error",
            message: "Could not save.",
            variant: .destructive
        )
    }
}
