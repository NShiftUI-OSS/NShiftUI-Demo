import SwiftUI
import UIKit

struct SCNInputOTP: View {
    @EnvironmentObject private var theme: SCNTheme
    @FocusState private var isFocused: Bool
    @State private var caretOn = true

    private let length: Int
    @Binding private var code: String

    init(
        length: Int,
        code: Binding<String>
    ) {
        self.length = max(length, 1)
        _code = code
    }

    private var digits: Binding<String> {
        Binding(
            get: { code },
            set: { value in
                let filtered = value.filter(\.isNumber)
                code = String(filtered.prefix(length))
            }
        )
    }

    private var activeIndex: Int {
        min(code.count, length - 1)
    }

    private var fieldWidth: CGFloat {
        theme.spacing.s11 * CGFloat(length)
            - theme.border.hairline * CGFloat(max(length - 1, 0))
    }

    var body: some View {
        ZStack(alignment: .leading) {
            HStack(spacing: -theme.border.hairline) {
                ForEach(0..<length, id: \.self) { index in
                    digit(at: index)
                        .zIndex(isFocused && index == activeIndex ? 1 : 0)
                }
            }
            .allowsHitTesting(false)
            TextField("", text: digits)
                .focused($isFocused)
                .keyboardType(.numberPad)
                .textContentType(.oneTimeCode)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .foregroundStyle(.clear)
                .tint(.clear)
                .accentColor(.clear)
                .opacity(0)
                .frame(width: fieldWidth, height: theme.spacing.s11)
        }
        .frame(width: fieldWidth, height: theme.spacing.s11, alignment: .leading)
        .contentShape(Rectangle())
        .onTapGesture {
            isFocused = true
        }
        .onAppear {
            // Scoped to the caret (see its `.animation`), so the repeating
            // blink never leaks into other layout changes.
            caretOn = false
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Verification code")
        .accessibilityValue(code)
    }
}

extension SCNInputOTP {
    private func digit(at index: Int) -> some View {
        let characters = Array(code)
        let symbol = index < characters.count ? String(characters[index]) : ""
        let isActive = isFocused && index == activeIndex
        let outline = OTPSlotOutline(
            leadingRadius: index == 0 ? theme.radius.md : 0,
            trailingRadius: index == length - 1 ? theme.radius.md : 0
        )
        let border = isActive ? theme.palette.ring : theme.palette.input
        return ZStack {
            outline.fill(fieldFill)
            SCNText(symbol, style: .sm, weight: .medium)
            if isActive && symbol.isEmpty {
                Rectangle()
                    .fill(theme.palette.foreground)
                    .frame(width: 1, height: theme.spacing.s4)
                    .opacity(caretOn ? 1 : 0)
                    .animation(
                        .easeInOut(duration: 0.7).repeatForever(autoreverses: true),
                        value: caretOn
                    )
            }
        }
        .frame(width: theme.spacing.s11, height: theme.spacing.s11)
        .overlay(outline.strokeBorder(border, lineWidth: theme.border.hairline))
        .overlay {
            if isActive {
                OTPSlotOutline(
                    leadingRadius: index == 0 ? theme.radius.md : 0,
                    trailingRadius: index == length - 1 ? theme.radius.md : 0,
                    insetAmount: -1.5
                )
                .stroke(theme.palette.ring.opacity(0.5), lineWidth: 3)
            }
        }
    }

    private var fieldFill: Color {
        guard theme.interfaceStyle == .dark else {
            return theme.palette.background
        }
        return theme.palette.input.opacity(theme.opacity.field)
    }
}

private struct OTPSlotOutline: InsettableShape {
    var leadingRadius: CGFloat
    var trailingRadius: CGFloat
    var insetAmount: CGFloat = 0

    func inset(by amount: CGFloat) -> OTPSlotOutline {
        var copy = self
        copy.insetAmount += amount
        return copy
    }

    func path(in rect: CGRect) -> Path {
        let rect = rect.insetBy(dx: insetAmount, dy: insetAmount)
        var corners: UIRectCorner = []
        if leadingRadius > 0 {
            corners.formUnion([.topLeft, .bottomLeft])
        }
        if trailingRadius > 0 {
            corners.formUnion([.topRight, .bottomRight])
        }
        let radius = max(0, max(leadingRadius, trailingRadius) - insetAmount)
        let bezier: UIBezierPath
        if corners.isEmpty || radius == 0 {
            bezier = UIBezierPath(rect: rect)
        } else {
            bezier = UIBezierPath(
                roundedRect: rect,
                byRoundingCorners: corners,
                cornerRadii: CGSize(width: radius, height: radius)
            )
        }
        return Path(bezier.cgPath)
    }
}

struct SCNInputOTPPreview: View {
    @State private var code = "12"

    var body: some View {
        SCNComponentPreview {
            SCNInputOTP(length: 6, code: $code)
        }
    }
}

#Preview {
    SCNInputOTPPreview()
}
