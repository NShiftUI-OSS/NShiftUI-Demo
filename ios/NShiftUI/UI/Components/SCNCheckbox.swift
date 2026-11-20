import SwiftUI

struct SCNCheckbox: View {
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
                box
                SCNText(title)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var box: some View {
        RoundedRectangle(
            cornerRadius: theme.spacing.s1,
            style: .continuous
        )
            .fill(fill)
            .overlay(
                RoundedRectangle(
                    cornerRadius: theme.spacing.s1,
                    style: .continuous
                )
                    .strokeBorder(
                        isOn ? theme.palette.primary : theme.palette.input,
                        lineWidth: theme.border.hairline
                    )
            )
            .overlay {
                SCNCheckmark()
                    .stroke(
                        theme.palette.primaryForeground,
                        style: StrokeStyle(
                            lineWidth: theme.border.hairline * 1.5,
                            lineCap: .round,
                            lineJoin: .round
                        )
                    )
                    .frame(
                        width: theme.spacing.s3_5,
                        height: theme.spacing.s3_5
                    )
                    .opacity(isOn ? theme.opacity.opaque : 0)
            }
            .frame(
                width: theme.spacing.s4,
                height: theme.spacing.s4
            )
    }

    private var fill: Color {
        if isOn {
            return theme.palette.primary
        }
        guard theme.interfaceStyle == .dark else {
            return Color.clear
        }
        return theme.palette.input.opacity(theme.opacity.field)
    }
}

struct SCNCheckboxPreview: View {
    @State private var on = true
    @State private var off = false

    var body: some View {
        SCNComponentPreview {
            SCNCheckbox(
                title: "Checked",
                isOn: $on
            )
            SCNCheckbox(
                title: "Unchecked",
                isOn: $off
            )
        }
    }
}

#Preview {
    SCNCheckboxPreview()
}
