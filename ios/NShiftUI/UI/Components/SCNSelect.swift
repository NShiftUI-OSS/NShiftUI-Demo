import SwiftUI

struct SCNSelect: View {
    @EnvironmentObject private var theme: SCNTheme

    private let options: [String]
    @Binding private var selection: String

    init(
        options: [String],
        selection: Binding<String>
    ) {
        self.options = options
        _selection = selection
    }

    var body: some View {
        Picker(selection: $selection) {
            ForEach(options, id: \.self) { option in
                Text(option).tag(option)
            }
        } label: {
            HStack(spacing: theme.spacing.s2) {
                SCNText(
                    selection,
                    style: .sm
                )
                Spacer(minLength: theme.spacing.s2)
                SCNIcon(
                    .chevronDown,
                    size: theme.spacing.s4,
                    color: theme.palette.mutedForeground.opacity(0.5)
                )
            }
            .padding(.horizontal, theme.spacing.s3)
            .frame(
                maxWidth: .infinity,
                minHeight: theme.spacing.s11,
                alignment: .leading
            )
            .background(fill)
            .clipShape(fieldShape)
            .overlay(
                fieldShape.strokeBorder(
                    theme.palette.input,
                    lineWidth: theme.border.hairline
                )
            )
        }
        .pickerStyle(.menu)
        .tint(theme.palette.foreground)
    }

    private var fieldShape: RoundedRectangle {
        RoundedRectangle(
            cornerRadius: theme.radius.md,
            style: .continuous
        )
    }

    private var fill: Color {
        guard theme.interfaceStyle == .dark else {
            return Color.clear
        }
        return theme.palette.input.opacity(theme.opacity.field)
    }
}

struct SCNSelectPreview: View {
    @State private var selection = "Apple"

    var body: some View {
        SCNComponentPreview {
            SCNSelect(
                options: ["Apple", "Banana", "Grape"],
                selection: $selection
            )
        }
    }
}

#Preview {
    SCNSelectPreview()
}
