import SwiftUI

struct SCNAttachment: View {
    @EnvironmentObject private var theme: SCNTheme

    enum State {
        case idle
        case uploading
        case processing
        case error
        case done
    }

    enum Size {
        case xs
        case sm
        case `default`
    }

    enum Orientation {
        case horizontal
        case vertical
    }

    private let title: String
    private let detail: String?
    private let state: State
    private let size: Size
    private let orientation: Orientation

    private var isBusy: Bool {
        state == .uploading || state == .processing
    }

    private var mediaLength: CGFloat {
        switch size {
        case .xs:
            return theme.spacing.s7
        case .sm:
            return theme.spacing.s8
        case .default:
            return theme.spacing.s10
        }
    }

    private var mediaPadding: CGFloat {
        switch size {
        case .xs:
            return theme.spacing.s1
        case .sm:
            return theme.spacing.s1_5
        case .default:
            return theme.spacing.s2
        }
    }

    private var contentHorizontalPadding: CGFloat {
        switch size {
        case .xs:
            return theme.spacing.s1_5
        case .sm:
            return theme.spacing.s2
        case .default:
            return theme.spacing.s2_5
        }
    }

    private var contentVerticalPadding: CGFloat {
        switch size {
        case .xs:
            return theme.spacing.s1
        case .sm:
            return theme.spacing.s1_5
        case .default:
            return theme.spacing.s2
        }
    }

    private var contentSpacing: CGFloat {
        theme.spacing.s2
    }

    private var titleStyle: SCNText.Style {
        size == .default ? .sm : .xs
    }

    private var borderColor: Color {
        state == .error
            ? theme.palette.destructive.opacity(theme.opacity.subtle)
            : theme.palette.border
    }

    private var dash: [CGFloat] {
        state == .idle ? [theme.spacing.s1, theme.spacing.s0_5] : []
    }

    private var mediaForeground: Color {
        state == .error ? theme.palette.destructive : theme.palette.foreground
    }

    private var mediaBackground: Color {
        state == .error ? theme.palette.destructive.opacity(theme.opacity.subtle) : theme.palette.muted
    }

    init(
        title: String,
        detail: String? = nil,
        state: State = .done,
        size: Size = .default,
        orientation: Orientation = .horizontal
    ) {
        self.title = title
        self.detail = detail
        self.state = state
        self.size = size
        self.orientation = orientation
    }

    var body: some View {
        Group {
            if orientation == .vertical {
                VStack(
                    alignment: .leading,
                    spacing: contentSpacing
                ) {
                    media()
                        .padding(mediaPadding)
                    labels()
                        .padding(.horizontal, contentHorizontalPadding)
                        .padding(.vertical, contentVerticalPadding)
                }
            } else {
                HStack(spacing: contentSpacing) {
                    media()
                        .padding(mediaPadding)
                    labels()
                        .padding(.vertical, contentVerticalPadding)
                        .padding(.horizontal, contentHorizontalPadding)
                }
            }
        }
        .background(theme.palette.card)
        .overlay(
            RoundedRectangle(
                cornerRadius: theme.radius.xl,
                style: .continuous
            )
                .stroke(
                    borderColor,
                    style: StrokeStyle(
                        lineWidth: theme.border.hairline,
                        dash: dash
                    )
                )
        )
        .clipShape(
            RoundedRectangle(
                cornerRadius: theme.radius.xl,
                style: .continuous
            )
        )
    }
}

extension SCNAttachment {
    private func media() -> some View {
        ZStack {
            RoundedRectangle(
                cornerRadius: theme.radius.lg,
                style: .continuous
            )
                .fill(mediaBackground)
            if isBusy {
                SCNSpinner()
            } else {
                SCNIcon(
                    state == .error ? .triangleAlert : .file,
                    size: size == .xs ? theme.spacing.s3_5 : theme.spacing.s4,
                    color: mediaForeground
                )
            }
        }
        .frame(
            width: mediaLength,
            height: mediaLength
        )
    }
}

extension SCNAttachment {
    private func labels() -> some View {
        VStack(
            alignment: .leading,
            spacing: theme.spacing.s0_5
        ) {
            SCNText(
                title,
                style: titleStyle,
                weight: .medium,
                color: .cardForeground
            )
            .lineLimit(1)
            if let detail {
                SCNText(
                    detail,
                    style: .xs,
                    color: state == .error ? .destructive : .mutedForeground
                )
                .opacity(state == .error ? theme.opacity.pressed : theme.opacity.opaque)
                .lineLimit(1)
            }
        }
    }
}

#Preview {
    SCNComponentPreview {
        SCNAttachment(
            title: "report.pdf",
            detail: "Ready",
            state: .done
        )
        SCNAttachment(
            title: "foto.png",
            detail: "Uploading",
            state: .uploading,
            size: .sm
        )
        SCNAttachment(
            title: "failure.txt",
            detail: "Error",
            state: .error,
            size: .xs
        )
        SCNAttachment(
            title: "draft",
            detail: "Waiting",
            state: .idle,
            orientation: .vertical
        )
    }
}
