import SwiftUI

struct SCNPreviewChrome<Content: View>: View {
    @EnvironmentObject private var theme: SCNTheme
    private let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s3
        ) {
            content()
        }
        .padding(theme.spacing.s4)
        .frame(
            maxWidth: .infinity,
            maxHeight: .infinity,
            alignment: .topLeading
        )
    }
}
