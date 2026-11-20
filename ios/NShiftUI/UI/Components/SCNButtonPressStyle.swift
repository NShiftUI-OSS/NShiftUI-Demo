import SwiftUI

struct SCNButtonPressStyle: ButtonStyle {
    @EnvironmentObject private var theme: SCNTheme
    private let variant: SCNButton.Variant
    private let size: SCNButton.Size
    private let isEnabled: Bool
    private let cornerRadius: CGFloat?
    private let drawsBorder: Bool

    init(
        variant: SCNButton.Variant,
        size: SCNButton.Size,
        isEnabled: Bool,
        cornerRadius: CGFloat? = nil,
        drawsBorder: Bool = true
    ) {
        self.variant = variant
        self.size = size
        self.isEnabled = isEnabled
        self.cornerRadius = cornerRadius
        self.drawsBorder = drawsBorder
    }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .contentShape(Rectangle())
            .background(
                background(
                    theme: theme,
                    pressed: configuration.isPressed
                )
            )
            .overlay {
                if drawsBorder, borderWidth(theme) > 0 {
                    RoundedRectangle(
                        cornerRadius: corner(theme),
                        style: .continuous
                    )
                    .stroke(
                        borderColor(theme),
                        lineWidth: borderWidth(theme)
                    )
                }
            }
            .clipShape(
                RoundedRectangle(
                    cornerRadius: corner(theme),
                    style: .continuous
                )
            )
            .opacity(isEnabled ? (configuration.isPressed ? theme.opacity.pressed : theme.opacity.opaque) : theme.opacity.disabled)
    }

    private func corner(_ theme: SCNTheme) -> CGFloat {
        if let cornerRadius {
            return cornerRadius
        }
        switch size {
        case .xs, .iconXs: return theme.radius.controlXs
        case .sm, .iconSm: return theme.radius.controlSm
        default: return theme.radius.md
        }
    }

    private func borderWidth(_ theme: SCNTheme) -> CGFloat {
        variant == .outline ? theme.border.hairline : theme.border.none
    }

    private func borderColor(_ theme: SCNTheme) -> Color {
        guard variant == .outline else {
            return Color.clear
        }
        if theme.interfaceStyle == .dark {
            return theme.palette.input
        }
        return theme.palette.border
    }

    private func background(
        theme: SCNTheme,
        pressed: Bool
    ) -> Color {
        switch variant {
        case .default:
            return theme.palette.primary.opacity(pressed ? theme.opacity.pressed : theme.opacity.opaque)
        case .outline:
            if theme.interfaceStyle == .dark {
                return theme.palette.input.opacity(
                    pressed ? theme.opacity.disabled : theme.opacity.field
                )
            }
            return pressed ? theme.palette.accent : theme.palette.background
        case .secondary:
            return theme.palette.secondary
        case .ghost:
            return pressed ? theme.palette.accent : Color.clear
        case .destructive:
            if theme.interfaceStyle == .dark {
                return theme.palette.destructive.opacity(0.6)
            }
            return theme.palette.destructive
        case .link:
            return Color.clear
        }
    }
}
