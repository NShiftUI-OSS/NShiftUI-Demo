import SwiftUI

struct SCNSwitch: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var isOn: Bool

    init(isOn: Binding<Bool>) {
        _isOn = isOn
    }

    var body: some View {
        let height = theme.spacing.s8
        let width = theme.spacing.s12 + theme.spacing.s1
        let inset = theme.spacing.s0_5
        let thumb = height - inset * 2
        ZStack(alignment: .leading) {
            Capsule()
                .fill(isOn ? theme.palette.primary : trackColor)
            Circle()
                .fill(thumbColor)
                .frame(
                    width: thumb,
                    height: thumb
                )
                .shadow(
                    color: theme.palette.foreground.opacity(theme.opacity.subtle),
                    radius: theme.spacing.s0_5,
                    y: theme.spacing.s0_5
                )
                .offset(x: isOn ? width - thumb - inset : inset)
        }
        .frame(
            width: width,
            height: height
        )
        .clipShape(Capsule())
            .contentShape(Capsule())
            .onTapGesture {
                isOn.toggle()
            }
            .gesture(
                DragGesture(minimumDistance: theme.spacing.s2)
                    .onEnded { value in
                        isOn = value.translation.width > 0
                    }
            )
            .animation(
                theme.animation(.soft, .ms300),
                value: isOn
            )
            .accessibilityElement()
            .accessibilityLabel("Switch")
            .accessibilityValue(isOn ? "On" : "Off")
            .accessibilityAddTraits(.isButton)
            .accessibilityAction {
                isOn.toggle()
            }
    }

    private var trackColor: Color {
        guard theme.interfaceStyle == .dark else {
            return theme.palette.input
        }
        return theme.palette.input.opacity(theme.opacity.pressed)
    }

    private var thumbColor: Color {
        guard theme.interfaceStyle == .dark else {
            return theme.palette.background
        }
        return isOn
            ? theme.palette.primaryForeground
            : theme.palette.foreground
    }
}

struct SCNSwitchPreview: View {
    @State private var on = true
    @State private var off = false

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: SCNTheme.shared.spacing.s3
        ) {
            SCNSwitch(isOn: $on)
            SCNSwitch(isOn: $off)
        }
    }
}

#Preview {
    SCNComponentPreview {
        SCNSwitchPreview()
    }
}
