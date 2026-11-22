import SwiftUI

/// Round floating action button with an icon and an optional notification
/// badge on its top-right corner.
struct SCNFloatingButton: View {
    @EnvironmentObject private var theme: SCNTheme
    let icon: SCNIconName?
    let badge: String?
    let action: () -> Void

    init(icon: SCNIconName?, badge: String? = nil, action: @escaping () -> Void) {
        self.icon = icon
        self.badge = badge
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(theme.palette.primary)
                if let icon {
                    SCNIcon(icon, size: theme.spacing.s6, color: theme.palette.primaryForeground)
                }
            }
            .frame(width: 56, height: 56)
            .shadow(color: .black.opacity(0.25), radius: 10, x: 0, y: 6)
            .overlay(alignment: .topTrailing) {
                if let badge, badge.isEmpty == false {
                    BadgeCount(text: badge)
                        .offset(x: 4, y: -4)
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: badge)
        }
        .buttonStyle(FloatingPressStyle())
    }
}

private struct BadgeCount: View {
    @EnvironmentObject private var theme: SCNTheme
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: theme.type.xs, weight: .semibold))
            .monospacedDigit()
            .foregroundStyle(Color.white)
            .padding(.horizontal, 6)
            .frame(minWidth: 22, minHeight: 22)
            .background(theme.palette.destructive, in: Capsule())
            .overlay(Capsule().strokeBorder(theme.palette.background, lineWidth: 2))
            .id(text)
            .transition(.scale(scale: 1.4).combined(with: .opacity))
    }
}

private struct FloatingPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

#Preview {
    SCNComponentPreview {
        SCNFloatingButton(icon: .shoppingCart, badge: "3") {}
    }
}
