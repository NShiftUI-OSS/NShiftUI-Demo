import SwiftUI
import UIKit

struct SCNTextarea: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var text: String
    private let placeholder: String
    @State private var contentHeight: CGFloat = 0

    init(
        text: Binding<String>,
        placeholder: String = ""
    ) {
        _text = text
        self.placeholder = placeholder
    }

    var body: some View {
        SCNTextareaControl(
            text: $text,
            placeholder: placeholder,
            contentHeight: $contentHeight
        )
        .frame(maxWidth: .infinity)
        .frame(height: max(theme.spacing.s16, contentHeight))
    }
}

private struct SCNTextareaControl: UIViewRepresentable {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var text: String
    @Binding private var contentHeight: CGFloat
    private let placeholder: String

    init(
        text: Binding<String>,
        placeholder: String,
        contentHeight: Binding<CGFloat>
    ) {
        _text = text
        self.placeholder = placeholder
        _contentHeight = contentHeight
    }

    func makeUIView(context: Context) -> SCNTextAreaView {
        let view = SCNTextAreaView()
        view.delegate = context.coordinator
        view.backgroundColor = .clear
        view.isOpaque = false
        view.isScrollEnabled = false
        view.showsVerticalScrollIndicator = false
        view.textContainer.lineFragmentPadding = 0
        view.textContainer.widthTracksTextView = true
        view.setContentCompressionResistancePriority(
            .defaultLow,
            for: .horizontal
        )
        return view
    }

    func updateUIView(
        _ view: SCNTextAreaView,
        context: Context
    ) {
        if view.text != text {
            view.text = text
        }
        let font = theme.uiFont(theme.type.sm)
        let foreground = theme.palette.foregroundUIColor
        view.font = font
        view.textColor = foreground
        view.typingAttributes = [
            .font: font,
            .foregroundColor: foreground
        ]
        view.tintColor = UIColor(theme.palette.primary)
        view.keyboardAppearance = theme.interfaceStyle == .dark ? .dark : .light
        view.textContainerInset = UIEdgeInsets(
            top: theme.spacing.s3,
            left: theme.spacing.s2_5,
            bottom: theme.spacing.s3,
            right: theme.spacing.s2_5
        )
        view.backgroundColor = theme.interfaceStyle == .dark
            ? UIColor(theme.palette.input).withAlphaComponent(theme.opacity.field)
            : UIColor(theme.palette.background)
        view.isOpaque = false
        view.layer.cornerRadius = theme.radius.md
        view.layer.masksToBounds = true
        view.layer.borderWidth = theme.border.hairline
        view.layer.borderColor = UIColor(theme.palette.input).cgColor
        view.placeholder = placeholder
        view.applyPlaceholder(
            font: font,
            color: theme.palette.mutedForegroundUIColor
        )
        view.onContentHeight = { fitted in
            guard abs(fitted - contentHeight) > 0.5 else {
                return
            }
            DispatchQueue.main.async {
                contentHeight = fitted
            }
        }
        view.reportHeight()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(text: $text)
    }

    final class Coordinator: NSObject, UITextViewDelegate {
        @Binding private var text: String

        init(text: Binding<String>) {
            _text = text
        }

        func textViewDidChange(_ textView: UITextView) {
            text = textView.text
            (textView as? SCNTextAreaView)?.reportHeight()
        }
    }
}

private final class SCNTextAreaView: UITextView {
    var onContentHeight: ((CGFloat) -> Void)?
    var placeholder = "" {
        didSet {
            placeholderLabel.text = placeholder
        }
    }

    private let placeholderLabel = UILabel()

    override init(
        frame: CGRect,
        textContainer: NSTextContainer?
    ) {
        super.init(frame: frame, textContainer: textContainer)
        placeholderLabel.numberOfLines = 0
        addSubview(placeholderLabel)
    }

    required init?(coder: NSCoder) {
        return nil
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        layoutPlaceholder()
        reportHeight()
    }

    func applyPlaceholder(font: UIFont, color: UIColor) {
        placeholderLabel.font = font
        placeholderLabel.textColor = color
        placeholderLabel.isHidden = !text.isEmpty
        layoutPlaceholder()
    }

    func reportHeight() {
        guard bounds.width > 0 else {
            return
        }
        let fitted = sizeThatFits(
            CGSize(
                width: bounds.width,
                height: .greatestFiniteMagnitude
            )
        ).height
        onContentHeight?(fitted)
    }

    private func layoutPlaceholder() {
        let inset = textContainerInset
        let width = max(0, bounds.width - inset.left - inset.right)
        let height = placeholderLabel.sizeThatFits(
            CGSize(width: width, height: .greatestFiniteMagnitude)
        ).height
        placeholderLabel.frame = CGRect(
            x: inset.left,
            y: inset.top,
            width: width,
            height: height
        )
        placeholderLabel.isHidden = !text.isEmpty
    }
}

struct SCNTextareaPreview: View {
    @State private var text = ""

    var body: some View {
        SCNComponentPreview {
            SCNTextarea(
                text: $text,
                placeholder: "Message"
            )
        }
    }
}

#Preview {
    SCNTextareaPreview()
}
