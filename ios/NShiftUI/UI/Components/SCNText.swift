import SwiftUI

struct SCNText: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Style {
        case xs
        case sm
        case base
        case lg
        case xl
        case xl2
    }

    enum Weight {
        case regular
        case medium
        case semibold
    }

    enum Color {
        case foreground
        case mutedForeground
        case primary
        case primaryForeground
        case secondaryForeground
        case accentForeground
        case destructive
        case cardForeground
        case popoverForeground
        case white
    }

    private let text: String
    private let style: Style
    private let weight: Weight
    private let color: Color

    private var size: CGFloat {
        switch style {
        case .xs:
            return theme.type.xs
        case .sm:
            return theme.type.sm
        case .base:
            return theme.type.base
        case .lg:
            return theme.type.lg
        case .xl:
            return theme.type.xl
        case .xl2:
            return theme.type.xl2
        }
    }

    private var fontWeight: Font.Weight {
        switch weight {
        case .regular:
            return .regular
        case .medium:
            return .medium
        case .semibold:
            return .semibold
        }
    }

    private var ink: SwiftUI.Color {
        switch color {
        case .foreground:
            return theme.palette.foreground
        case .mutedForeground:
            return theme.palette.mutedForeground
        case .primary:
            return theme.palette.primary
        case .primaryForeground:
            return theme.palette.primaryForeground
        case .secondaryForeground:
            return theme.palette.secondaryForeground
        case .accentForeground:
            return theme.palette.accentForeground
        case .destructive:
            return theme.palette.destructive
        case .white:
            return SwiftUI.Color.white
        case .cardForeground:
            return theme.palette.cardForeground
        case .popoverForeground:
            return theme.palette.popoverForeground
        }
    }

    init(
        _ text: String,
        style: Style = .sm,
        weight: Weight = .regular,
        color: Color = .foreground
    ) {
        self.text = text
        self.style = style
        self.weight = weight
        self.color = color
    }

    var body: some View {
        Text(text)
            .font(
                theme.font(
                    size,
                    weight: fontWeight
                )
            )
            .foregroundColor(ink)
            .fixedSize(horizontal: false, vertical: true)
    }
}

#Preview {
    SCNComponentPreview {
        SCNText(
            "Title",
            style: .xl,
            weight: .semibold
        )
        SCNText("Body")
        SCNText(
            "Supporting",
            color: .mutedForeground
        )
        SCNText(
            "Destructive",
            weight: .medium,
            color: .destructive
        )
    }
}
