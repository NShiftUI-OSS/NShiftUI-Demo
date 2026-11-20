import SwiftUI

struct SCNRadio: View {
    @EnvironmentObject private var theme: SCNTheme
    private let title: String
    @Binding private var isOn: Bool

    init(
        title: String,
        isOn: Binding<Bool>
    ) {
        self.title = title
        _isOn = isOn
    }

    var body: some View {
        Button {
            isOn.toggle()
        } label: {
            HStack(spacing: theme.spacing.s2) {
                mark
                SCNText(title)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var mark: some View {
        Circle()
            .fill(track)
            .overlay(
                Circle()
                    .strokeBorder(
                        theme.palette.input,
                        lineWidth: theme.border.hairline
                    )
            )
            .overlay {
                Circle()
                    .fill(theme.palette.primary)
                    .frame(
                        width: theme.spacing.s2,
                        height: theme.spacing.s2
                    )
                    .opacity(isOn ? theme.opacity.opaque : 0)
            }
            .frame(
                width: theme.spacing.s4,
                height: theme.spacing.s4
            )
    }

    private var track: Color {
        guard theme.interfaceStyle == .dark else {
            return Color.clear
        }
        return theme.palette.input.opacity(theme.opacity.field)
    }
}

struct SCNRadioPreview: View {
    @State private var on = true
    @State private var off = false

    var body: some View {
        SCNComponentPreview {
            SCNRadio(
                title: "Selected",
                isOn: $on
            )
            SCNRadio(
                title: "Unselected",
                isOn: $off
            )
        }
    }
}

#Preview {
    SCNRadioPreview()
}
