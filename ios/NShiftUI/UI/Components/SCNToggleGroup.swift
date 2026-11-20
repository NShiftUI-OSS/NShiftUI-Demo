import SwiftUI

struct SCNToggleGroup: View {
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
        HStack(spacing: theme.spacing.s0) {
            ForEach(
                options,
                id: \.self
            ) { option in
                Button {
                    selection = option
                } label: {
                    SCNText(
                        option,
                        weight: .medium,
                        color: option == selection ? .accentForeground : .foreground
                    )
                        .frame(maxWidth: .infinity)
                        .frame(height: theme.spacing.s9)
                        .background(option == selection ? theme.palette.accent : Color.clear)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.md,
                style: .continuous
            )
                .stroke(
                    theme.palette.border,
                    lineWidth: theme.border.hairline
                )
        )
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.md,
                style: .continuous
            )
        )
        .animation(
            theme.animation(.out, .ms150),
            value: selection
        )
    }
}

struct SCNToggleGroupPreview: View {
    @State private var selection = "Day"

    var body: some View {
        SCNComponentPreview {
            SCNToggleGroup(
                options: ["Day", "Week", "Month"],
                selection: $selection
            )
        }
    }
}

#Preview {
    SCNToggleGroupPreview()
}
