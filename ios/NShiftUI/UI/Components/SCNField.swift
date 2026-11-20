import SwiftUI

struct SCNField<Control: View>: View {
    @EnvironmentObject private var theme: SCNTheme
    private let label: String
    private let hint: String?
    private let control: () -> Control

    init(
        label: String,
        hint: String? = nil,
        @ViewBuilder control: @escaping () -> Control
    ) {
        self.label = label
        self.hint = hint
        self.control = control
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s2
        ) {
            SCNText(
                label,
                weight: .medium
            )
            control()
            if let hint {
                SCNText(
                    hint,
                    style: .xs,
                    color: .mutedForeground
                )
            }
        }
    }
}

struct SCNFieldPreview: View {
    @State private var name = ""

    var body: some View {
        SCNComponentPreview {
            SCNField(
                label: "Name",
                hint: "Shown on your profile"
            ) {
                SCNInput(
                    text: $name,
                    placeholder: "Ada"
                )
            }
        }
    }
}

#Preview {
    SCNFieldPreview()
}
