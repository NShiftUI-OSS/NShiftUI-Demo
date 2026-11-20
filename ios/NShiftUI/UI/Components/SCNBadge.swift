import SwiftUI

struct SCNBadge: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Variant {
        case `default`
        case secondary
        case destructive
        case outline
        case ghost
        case link
    }

    private let text: String
    private let variant: Variant

    private var textColor: SCNText.Color {
        switch variant {
        case .default: return .primaryForeground
        case .secondary: return .secondaryForeground
        case .destructive: return .white
        case .outline, .ghost: return .foreground
        case .link: return .primary
        }
    }

    private var background: Color {
        switch variant {
        case .default: return theme.palette.primary
        case .secondary: return theme.palette.secondary
        case .destructive:
            if theme.interfaceStyle == .dark {
                return theme.palette.destructive.opacity(0.6)
            }
            return theme.palette.destructive
        case .outline, .ghost, .link: return Color.clear
        }
    }

    private var border: Color {
        variant == .outline ? theme.palette.border : Color.clear
    }

    init(
        text: String,
        variant: Variant = .default
    ) {
        self.text = text
        self.variant = variant
    }

    var body: some View {
        SCNText(
            text,
            style: .xs,
            weight: .medium,
            color: textColor
        )
            .padding(
                .horizontal,
                theme.spacing.s2
            )
            .padding(
                .vertical,
                theme.spacing.s0_5
            )
            .background(background)
            .overlay(
                Capsule().stroke(
                    border,
                    lineWidth: theme.border.hairline
                )
            )
            .clipShape(Capsule())
    }
}

#Preview {
    SCNComponentPreview {
        SCNBadge(text: "Default")
        SCNBadge(
            text: "Secondary",
            variant: .secondary
        )
        SCNBadge(
            text: "Destructive",
            variant: .destructive
        )
        SCNBadge(
            text: "Outline",
            variant: .outline
        )
        SCNBadge(
            text: "Ghost",
            variant: .ghost
        )
        SCNBadge(
            text: "Link",
            variant: .link
        )
    }
}
