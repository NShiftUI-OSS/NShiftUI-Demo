import SwiftUI

struct SCNButton: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Variant {
        case `default`
        case outline
        case secondary
        case ghost
        case destructive
        case link
    }

    enum Size {
        case xs
        case sm
        case `default`
        case lg
        case iconXs
        case iconSm
        case icon
        case iconLg
    }

    private let title: String
    private let icon: SCNIconName?
    private let variant: Variant
    private let size: Size
    private let isEnabled: Bool
    private let isGrouped: Bool
    private let action: () -> Void

    private var textStyle: SCNText.Style {
        size == .xs || isIcon ? .xs : .sm
    }

    private var isIcon: Bool {
        switch size {
        case .iconXs, .iconSm, .icon, .iconLg:
            return true
        default:
            return false
        }
    }

    private var height: CGFloat {
        switch size {
        case .xs, .iconXs: return theme.spacing.s6
        case .sm, .iconSm: return theme.spacing.s8
        case .default, .icon: return theme.spacing.s9
        case .lg, .iconLg: return theme.spacing.s10
        }
    }

    private var minLength: CGFloat? {
        isIcon ? height : nil
    }

    private var horizontalPadding: CGFloat {
        if isIcon { return theme.spacing.s0 }
        switch size {
        case .xs: return theme.spacing.s2
        default: return theme.spacing.s2_5
        }
    }

    private var textColor: SCNText.Color {
        switch variant {
        case .default: return .primaryForeground
        case .outline, .ghost: return .foreground
        case .secondary: return .secondaryForeground
        case .destructive: return .white
        case .link: return .primary
        }
    }

    private var iconColor: Color {
        switch variant {
        case .default:
            return theme.palette.primaryForeground
        case .outline, .ghost:
            return theme.palette.foreground
        case .secondary:
            return theme.palette.secondaryForeground
        case .destructive:
            return Color.white
        case .link:
            return theme.palette.primary
        }
    }

    init(
        title: String,
        variant: Variant = .default,
        size: Size = .default,
        isEnabled: Bool = true,
        isGrouped: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = nil
        self.variant = variant
        self.size = size
        self.isEnabled = isEnabled
        self.isGrouped = isGrouped
        self.action = action
    }

    /// Icon followed by the title (shadcn's leading-icon button).
    init(
        title: String,
        icon: SCNIconName,
        variant: Variant = .default,
        size: Size = .default,
        isEnabled: Bool = true,
        isGrouped: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.variant = variant
        self.size = size
        self.isEnabled = isEnabled
        self.isGrouped = isGrouped
        self.action = action
    }

    init(
        icon: SCNIconName,
        variant: Variant = .default,
        size: Size = .default,
        isEnabled: Bool = true,
        isGrouped: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = ""
        self.icon = icon
        self.variant = variant
        self.size = size
        self.isEnabled = isEnabled
        self.isGrouped = isGrouped
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            Group {
                if let icon, title.isEmpty == false {
                    HStack(spacing: theme.spacing.s2) {
                        SCNIcon(
                            icon,
                            size: theme.spacing.s4,
                            color: iconColor
                        )
                        SCNText(
                            title,
                            style: textStyle,
                            weight: .medium,
                            color: textColor
                        )
                    }
                } else if let icon {
                    SCNIcon(
                        icon,
                        size: theme.spacing.s4,
                        color: iconColor
                    )
                } else {
                    SCNText(
                        title,
                        style: textStyle,
                        weight: .medium,
                        color: textColor
                    )
                }
            }
            .frame(
                minWidth: minLength,
                minHeight: height
            )
            .padding(
                .horizontal,
                horizontalPadding
            )
            .frame(
                maxWidth: isGrouped ? .infinity : nil,
                maxHeight: isGrouped ? .infinity : nil
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(
            SCNButtonPressStyle(
                variant: variant,
                size: size,
                isEnabled: isEnabled,
                cornerRadius: isGrouped ? theme.spacing.s0 : nil,
                drawsBorder: !isGrouped
            )
        )
        .disabled(!isEnabled)
    }
}

struct SCNButtonPreview: View {
    @EnvironmentObject private var theme: SCNTheme

    var body: some View {
        SCNComponentPreview {
            variantRow()
            sizeRow()
            SCNButton(
                title: "Disabled",
                isEnabled: false
            ) {}
        }
    }
}

extension SCNButtonPreview {
    private func variantRow() -> some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s2
        ) {
            SCNButton(title: "Default") {}
            SCNButton(
                title: "Outline",
                variant: .outline
            ) {}
            SCNButton(
                title: "Secondary",
                variant: .secondary
            ) {}
            SCNButton(
                title: "Ghost",
                variant: .ghost
            ) {}
            SCNButton(
                title: "Destructive",
                variant: .destructive
            ) {}
            SCNButton(
                title: "Link",
                variant: .link
            ) {}
        }
    }
}

extension SCNButtonPreview {
    private func sizeRow() -> some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s2
        ) {
            SCNButton(
                title: "XS",
                size: .xs
            ) {}
            SCNButton(
                title: "SM",
                size: .sm
            ) {}
            SCNButton(
                title: "LG",
                size: .lg
            ) {}
        }
    }
}

#Preview {
    SCNButtonPreview()
}
