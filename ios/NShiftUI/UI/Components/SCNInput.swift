import SwiftUI
import UIKit

struct SCNInput: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var text: String
    private let placeholder: String
    private let isSecure: Bool

    init(
        text: Binding<String>,
        placeholder: String = "",
        isSecure: Bool = false
    ) {
        _text = text
        self.placeholder = placeholder
        self.isSecure = isSecure
    }

    var body: some View {
        SCNInputControl(
            text: $text,
            placeholder: placeholder,
            isSecure: isSecure
        )
        .frame(maxWidth: .infinity)
        .frame(minHeight: theme.spacing.s11)
    }
}

private struct SCNInputControl: UIViewRepresentable {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var text: String
    private let placeholder: String
    private let isSecure: Bool

    init(
        text: Binding<String>,
        placeholder: String,
        isSecure: Bool
    ) {
        _text = text
        self.placeholder = placeholder
        self.isSecure = isSecure
    }

    func makeUIView(context: Context) -> UITextField {
        let field = UITextField()
        field.borderStyle = .none
        field.background = nil
        field.backgroundColor = .clear
        field.isOpaque = false
        field.adjustsFontForContentSizeCategory = true
        field.delegate = context.coordinator
        field.addTarget(
            context.coordinator,
            action: #selector(Coordinator.changed(_:)),
            for: .editingChanged
        )
        field.setContentCompressionResistancePriority(
            .defaultLow,
            for: .horizontal
        )
        return field
    }

    func updateUIView(
        _ field: UITextField,
        context: Context
    ) {
        if field.isSecureTextEntry != isSecure {
            field.isSecureTextEntry = isSecure
        }
        if field.text != text {
            field.text = text
        }
        let font = theme.uiFont(theme.type.sm)
        let foreground = theme.palette.foregroundUIColor
        field.font = font
        field.textColor = foreground
        field.defaultTextAttributes = [
            .font: font,
            .foregroundColor: foreground
        ]
        field.tintColor = UIColor(theme.palette.primary)
        field.keyboardAppearance = theme.interfaceStyle == .dark ? .dark : .light
        field.attributedPlaceholder = NSAttributedString(
            string: placeholder,
            attributes: [
                .font: font,
                .foregroundColor: UIColor(theme.palette.mutedForeground)
            ]
        )
        field.background = nil
        field.backgroundColor = fieldFill(theme)
        field.isOpaque = false
        field.layer.cornerRadius = theme.radius.md
        field.layer.masksToBounds = true
        field.layer.borderWidth = theme.border.hairline
        field.layer.borderColor = UIColor(theme.palette.input).cgColor
        let inset = theme.spacing.s2_5
        field.leftView = UIView(
            frame: CGRect(
                x: 0,
                y: 0,
                width: inset,
                height: theme.spacing.s1
            )
        )
        field.leftViewMode = .always
        field.rightView = UIView(
            frame: CGRect(
                x: 0,
                y: 0,
                width: inset,
                height: theme.spacing.s1
            )
        )
        field.rightViewMode = .always
    }

    private func fieldFill(_ theme: SCNTheme) -> UIColor {
        guard theme.interfaceStyle == .dark else {
            return UIColor(theme.palette.background)
        }
        return UIColor(theme.palette.input).withAlphaComponent(theme.opacity.field)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    final class Coordinator: NSObject, UITextFieldDelegate {
        @Binding private var text: String

        init(text: Binding<String>) {
            _text = text
        }

        @objc func changed(_ field: UITextField) {
            text = field.text ?? ""
        }
    }
}

struct SCNInputPreview: View {
    @State private var name = ""
    @State private var secret = ""

    var body: some View {
        SCNComponentPreview {
            SCNInput(
                text: $name,
                placeholder: "Name"
            )
            SCNInput(
                text: $secret,
                placeholder: "Password",
                isSecure: true
            )
        }
    }
}

#Preview {
    SCNInputPreview()
}
