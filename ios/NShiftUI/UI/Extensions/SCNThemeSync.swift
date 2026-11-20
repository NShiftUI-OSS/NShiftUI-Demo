import SwiftUI

struct SCNThemeSync<Content: View>: View {
    @ObservedObject private var theme = SCNTheme.shared
    @Environment(\.colorScheme) private var colorScheme
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .environmentObject(theme)
            .environment(
                \.theme,
                theme
            )
            .onAppear {
                theme.set(colorScheme: colorScheme)
            }
            .onChange(of: colorScheme) { scheme in
                theme.set(colorScheme: scheme)
            }
    }
}

