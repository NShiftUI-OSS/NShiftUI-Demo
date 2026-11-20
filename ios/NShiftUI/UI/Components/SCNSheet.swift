import SwiftUI

struct SCNSheet<Content: View>: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var isPresented: Bool
    private let title: String
    private let onPresented: () -> Void
    private let onDismissed: () -> Void
    private let content: () -> Content

    init(
        isPresented: Binding<Bool>,
        title: String,
        onPresented: @escaping () -> Void = {},
        onDismissed: @escaping () -> Void = {},
        @ViewBuilder content: @escaping () -> Content
    ) {
        self._isPresented = isPresented
        self.title = title
        self.onPresented = onPresented
        self.onDismissed = onDismissed
        self.content = content
    }

    var body: some View {
        sheetHost
    }

    @ViewBuilder
    private var sheetHost: some View {
        if #available(iOS 16.0, *) {
            Color.clear
                .frame(
                    width: theme.spacing.s0,
                    height: theme.spacing.s0
                )
                .accessibilityHidden(true)
                .scnSheet(
                    isPresented: $isPresented,
                    configuration: configuration
                ) {
                    sheetBody
                }
                .onChange(of: isPresented) { presented in
                    let duration = configuration.motion.duration
                    DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                        if presented {
                            onPresented()
                        } else {
                            onDismissed()
                        }
                    }
                }
        }
    }

    private var configuration: SCNSheetConfiguration {
        var configuration = SCNSheetConfiguration()
        configuration.detents = [.content, .large]
        configuration.prefersGrabberVisible = true
        configuration.prefersScrollingExpandsWhenScrolledToEdge = true
        configuration.preferredCornerRadius = theme.radius.lg
        configuration.backgroundColor = theme.palette.background
        configuration.grabberContentInset = theme.spacing.s4
        configuration.motion = SCNSheetMotion(
            animation: theme.animation(.out, .ms450),
            timing: theme.animation.timingParameters(.out, .ms450),
            duration: theme.animation.duration(.ms450)
        )
        return configuration
    }

    private var sheetBody: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s3
        ) {
            SCNText(
                title,
                style: .lg,
                weight: .semibold
            )
            .frame(
                maxWidth: .infinity,
                alignment: .center
            )
            content()
        }
        .padding(theme.spacing.s4)
        .frame(
            maxWidth: .infinity,
            alignment: .leading
        )
        .environment(
            \.theme,
            theme
        )
    }
}

struct SCNSheetPreview: View {
    @State private var isPresented: Bool

    init() {
        _isPresented = State(initialValue: false)
    }

    var body: some View {
        SCNComponentPreview {
            SCNButton(title: "Open") {
                isPresented = true
            }
            SCNSheet(
                isPresented: $isPresented,
                title: "Details"
            ) {
                SCNText(
                    "Supplementary content stays in the bottom sheet.",
                    color: .mutedForeground
                )
                SCNButton(title: "Close") {
                    isPresented = false
                }
            }
        }
    }
}

#Preview {
    SCNSheetPreview()
}
