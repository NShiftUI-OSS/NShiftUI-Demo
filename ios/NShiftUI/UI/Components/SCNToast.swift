import SwiftUI

struct SCNToast: View {
    @EnvironmentObject private var theme: SCNTheme

    private let title: String
    private let message: String?

    init(
        title: String,
        message: String? = nil
    ) {
        self.title = title
        self.message = message
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s1
        ) {
            SCNText(
                title,
                weight: .medium,
                color: .popoverForeground
            )
            if let message {
                SCNText(
                    message,
                    style: .xs,
                    color: .mutedForeground
                )
            }
        }
        .padding(theme.spacing.s3)
        .frame(
            maxWidth: .infinity,
            alignment: .leading
        )
        .background(theme.palette.popover)
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
                .stroke(
                    theme.palette.border,
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
        SCNToast(
            title: "Saved",
            message: "Your changes were saved."
        )
        SCNSonner(title: "Sent")
    }
}
