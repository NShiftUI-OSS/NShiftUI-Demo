import SwiftUI

struct SCNButtonGroup: View {
    @EnvironmentObject private var theme: SCNTheme
    private let titles: [String]
    private let action: (String) -> Void

    init(
        titles: [String],
        action: @escaping (String) -> Void
    ) {
        self.titles = titles
        self.action = action
    }

    var body: some View {
        HStack(spacing: theme.spacing.s0) {
            ForEach(
                Array(titles.enumerated()),
                id: \.offset
            ) { index, title in
                SCNButton(
                    title: title,
                    variant: .outline,
                    size: .sm,
                    isGrouped: true
                ) {
                    action(title)
                }
                if index < titles.count - 1 {
                    Rectangle()
                        .fill(outlineColor)
                        .frame(width: theme.border.hairline)
                        .frame(maxHeight: .infinity)
                }
            }
        }
        .clipShape(groupShape)
        .overlay(
            groupShape.strokeBorder(
                outlineColor,
                lineWidth: theme.border.hairline
            )
        )
    }

    private var groupShape: RoundedRectangle {
        RoundedRectangle(
            cornerRadius: theme.radius.md,
            style: .continuous
        )
    }

    private var outlineColor: Color {
        if theme.interfaceStyle == .dark {
            return theme.palette.input
        }
        return theme.palette.border
    }
}

#Preview {
    SCNComponentPreview {
        SCNButtonGroup(titles: ["Day", "Week", "Month"]) { _ in }
    }
}
