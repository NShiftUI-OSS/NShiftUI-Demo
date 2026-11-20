import SwiftUI

struct SCNTabs: View {
    @EnvironmentObject private var theme: SCNTheme

    private let titles: [String]
    @Binding private var selection: String

    init(
        titles: [String],
        selection: Binding<String>
    ) {
        self.titles = titles
        _selection = selection
    }

    var body: some View {
        HStack(spacing: theme.spacing.s0) {
            ForEach(
                titles,
                id: \.self
            ) { title in
                tab(title)
            }
        }
        .padding(3)
        .frame(height: theme.spacing.s9)
        .background(theme.palette.muted)
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.md,
                style: .continuous
            )
        )
        .animation(
            theme.animation(.out, .ms200),
            value: selection
        )
    }
}

extension SCNTabs {
    private func tab(
        _ title: String
    ) -> some View {
        let selected = title == selection
        return Button {
            selection = title
        } label: {
            SCNText(
                title,
                weight: .medium,
                color: selected ? .foreground : .mutedForeground
            )
                .frame(maxWidth: .infinity)
                .frame(maxHeight: .infinity)
                .background(activeFill(selected))
                .overlay(
                    RoundedRectangle(
                        cornerRadius: theme.radius.sm,
                        style: .continuous
                    )
                        .stroke(
                            selected && theme.interfaceStyle == .dark
                                ? theme.palette.input
                                : Color.clear,
                            lineWidth: theme.border.hairline
                        )
                )
                .clipShape(
                    RoundedRectangle(
                        cornerRadius: theme.radius.sm,
                        style: .continuous
                    )
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func activeFill(_ selected: Bool) -> Color {
        guard selected else {
            return Color.clear
        }
        if theme.interfaceStyle == .dark {
            return theme.palette.input.opacity(theme.opacity.field)
        }
        return theme.palette.background
    }
}

struct SCNTabsPreview: View {
    @State private var selection = "Account"

    var body: some View {
        SCNComponentPreview {
            SCNTabs(
                titles: ["Account", "Password"],
                selection: $selection
            )
        }
    }
}

#Preview {
    SCNTabsPreview()
}
