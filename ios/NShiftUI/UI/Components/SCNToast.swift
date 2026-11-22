import SwiftUI

struct SCNToast: View {
    @EnvironmentObject private var theme: SCNTheme

    /// Feedback colors follow shadcn's Sonner `richColors`.
    enum Variant: String {
        case `default`
        case success
        case error
        case info
        case warning
    }

    private let title: String
    private let message: String?
    private let icon: SCNIconName?
    private let variant: Variant

    init(
        title: String,
        message: String? = nil,
        icon: SCNIconName? = nil,
        variant: Variant = .default
    ) {
        self.title = title
        self.message = message
        self.icon = icon
        self.variant = variant
    }

    var body: some View {
        let colors = palette
        HStack(
            alignment: .center,
            spacing: theme.spacing.s3
        ) {
            if let icon {
                SCNIcon(
                    icon,
                    size: theme.spacing.s5,
                    color: colors.foreground
                )
            }
            VStack(
                alignment: .leading,
                spacing: theme.spacing.s1
            ) {
                Text(title)
                    .font(.system(size: theme.type.sm, weight: .medium))
                    .foregroundStyle(colors.foreground)
                if let message, message.isEmpty == false {
                    Text(message)
                        .font(.system(size: theme.type.xs))
                        .foregroundStyle(colors.secondary)
                }
            }
        }
        .padding(theme.spacing.s3)
        .frame(
            maxWidth: .infinity,
            alignment: .leading
        )
        .background(colors.background)
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
                .stroke(
                    colors.border,
                    lineWidth: theme.border.hairline
                )
        )
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
        )
    }

    private struct Colors {
        let background: Color
        let border: Color
        let foreground: Color
        let secondary: Color
    }

    private var palette: Colors {
        let dark = theme.interfaceStyle == .dark
        func rich(_ light: (UInt32, UInt32, UInt32), _ darkValues: (UInt32, UInt32, UInt32)) -> Colors {
            let values = dark ? darkValues : light
            let text = Color(hex: values.2)
            return Colors(
                background: Color(hex: values.0),
                border: Color(hex: values.1),
                foreground: text,
                secondary: text.opacity(0.85)
            )
        }
        switch variant {
        case .default:
            return Colors(
                background: theme.palette.popover,
                border: theme.palette.border,
                foreground: theme.palette.popoverForeground,
                secondary: theme.palette.mutedForeground
            )
        case .success:
            return rich((0xECFDF3, 0xBFFCD9, 0x008A2E), (0x001F0F, 0x003D1C, 0x59F3A6))
        case .error:
            return rich((0xFFF0F0, 0xFFE0E1, 0xE60000), (0x2D0607, 0x4D0408, 0xFF9EA1))
        case .info:
            return rich((0xF0F8FF, 0xD3E0FD, 0x0973DC), (0x000D1F, 0x00113D, 0x5896F3))
        case .warning:
            return rich((0xFFFCF0, 0xFDF5D3, 0xDC7609), (0x1D1F00, 0x3D3D00, 0xF3CF58))
        }
    }
}

private extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}

#Preview {
    SCNComponentPreview {
        SCNToast(
            title: "Saved",
            message: "Your changes were saved."
        )
        SCNToast(title: "Added", message: "In your cart", icon: .circleCheck, variant: .success)
        SCNSonner(title: "Sent")
    }
}
