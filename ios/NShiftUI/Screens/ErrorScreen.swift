import SwiftUI

struct ErrorScreen: View {
    @EnvironmentObject private var theme: SCNTheme
    let title: String?
    let retry: () -> Void

    var body: some View {
        VStack(spacing: theme.spacing.s2) {
            SCNText(
                "Couldn't load this screen",
                style: .lg,
                weight: .medium
            )
            SCNText(
                "Check the connection and try again.",
                color: .mutedForeground
            )
            .multilineTextAlignment(.center)
            SCNButton(
                title: "Try again",
                variant: .outline,
                action: retry
            )
        }
        .padding(theme.spacing.s6)
        .frame(
            maxWidth: .infinity,
            maxHeight: .infinity
        )
        .scnNavigationBar(title: title ?? "")
    }
}
