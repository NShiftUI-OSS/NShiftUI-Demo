import SwiftUI

/// Search field of the design system (shadcn-style): input surface with a
/// leading search icon, muted placeholder and a clear button while typing.
struct SCNSearchBar: View {
    @EnvironmentObject private var theme: SCNTheme
    @Binding private var text: String
    private let placeholder: String
    private let onSubmit: () -> Void

    init(
        text: Binding<String>,
        placeholder: String = "Buscar",
        onSubmit: @escaping () -> Void = {}
    ) {
        _text = text
        self.placeholder = placeholder
        self.onSubmit = onSubmit
    }

    var body: some View {
        HStack(spacing: theme.spacing.s2) {
            SCNIcon(.search, size: 16, color: theme.palette.mutedForeground)
            ZStack(alignment: .leading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(theme.font(theme.type.sm))
                        .foregroundColor(theme.palette.mutedForeground)
                        .lineLimit(1)
                }
                TextField("", text: $text)
                    .font(theme.font(theme.type.sm))
                    .foregroundColor(theme.palette.foreground)
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
                    .submitLabel(.search)
                    .onSubmit(onSubmit)
            }
            if text.isEmpty == false {
                Button {
                    text = ""
                    onSubmit()
                } label: {
                    SCNIcon(.x, size: 16, color: theme.palette.mutedForeground)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Limpar busca")
            }
        }
        .padding(.horizontal, theme.spacing.s3)
        .frame(maxWidth: .infinity, minHeight: theme.spacing.s11)
        .background(fill)
        .clipShape(RoundedRectangle(cornerRadius: theme.radius.md, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: theme.radius.md, style: .continuous)
                .stroke(theme.palette.input, lineWidth: theme.border.hairline)
        )
    }

    private var fill: Color {
        theme.interfaceStyle == .dark
            ? theme.palette.input.opacity(theme.opacity.field)
            : theme.palette.background
    }
}

#Preview {
    SCNComponentPreview {
        SCNSearchBar(text: .constant(""), placeholder: "Buscar Pokémon")
        SCNSearchBar(text: .constant("pika"), placeholder: "Buscar Pokémon")
    }
}
