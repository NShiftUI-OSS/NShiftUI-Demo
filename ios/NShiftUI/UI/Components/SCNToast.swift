import SwiftUI

struct SCNToast: View {
    @EnvironmentObject private var theme: SCNTheme

    private let title: String
    private let message: String?
    private let icon: SCNIconName?

    init(
        title: String,
        message: String? = nil,
        icon: SCNIconName? = nil
    ) {
        self.title = title
        self.message = message
        self.icon = icon
    }

    var body: some View {
        HStack(
            alignment: .center,
            spacing: theme.spacing.s3
        ) {
            if let icon {
                SCNIcon(
                    icon,
                    size: theme.spacing.s5,
                    color: theme.palette.popoverForeground
                )
            }
            VStack(
                alignment: .leading,
                spacing: theme.spacing.s1
            ) {
                SCNText(
                    title,
                    weight: .medium,
                    color: .popoverForeground
                )
                if let message, message.isEmpty == false {
                    SCNText(
                        message,
                        style: .xs,
                        color: .mutedForeground
                    )
                }
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
