import SwiftUI

struct SCNItem: View {
    @EnvironmentObject private var theme: SCNTheme
    private let title: String
    private let subtitle: String?
    private let initials: String

    init(
        title: String,
        subtitle: String? = nil,
        initials: String = ""
    ) {
        self.title = title
        self.subtitle = subtitle
        self.initials = initials
    }

    var body: some View {
        HStack(spacing: theme.spacing.s3) {
            if !initials.isEmpty {
                SCNAvatar(initials: initials)
            }
            VStack(
                alignment: .leading,
                spacing: theme.spacing.s1
            ) {
                SCNText(
                    title,
                    weight: .medium
                )
                if let subtitle {
                    SCNText(
                        subtitle,
                        style: .xs,
                        color: .mutedForeground
                    )
                }
            }
            Spacer(minLength: theme.spacing.s0)
        }
        .padding(theme.spacing.s3)
        .background(theme.palette.card)
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
        SCNItem(
            title: "Ada Lovelace",
            subtitle: "Mathematics",
            initials: "AL"
        )
        SCNItem(
            title: "No avatar",
            subtitle: "Single line"
        )
    }
}
