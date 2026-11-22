import SwiftUI

struct SCNAvatar: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Size {
        case sm
        case `default`
        case lg
        case xl
    }

    private let initials: String
    private let size: Size
    private let imageURL: String

    private var side: CGFloat {
        switch size {
        case .sm: return theme.spacing.s6
        case .default: return theme.spacing.s8
        case .lg: return theme.spacing.s10
        case .xl: return theme.spacing.s16 * 2
        }
    }

    private var textStyle: SCNText.Style {
        size == .lg ? .sm : .xs
    }

    init(
        initials: String,
        size: Size = .default,
        imageURL: String = ""
    ) {
        self.initials = initials
        self.size = size
        self.imageURL = imageURL
    }

    var body: some View {
        Group {
            if let url = URL(string: imageURL), url.scheme != nil {
                AsyncImage(url: url) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .scaledToFill()
                    } else {
                        initialsView
                    }
                }
            } else {
                initialsView
            }
        }
            .frame(
                width: side,
                height: side
            )
            .background(theme.palette.muted)
            .clipShape(Circle())
    }

    private var initialsView: some View {
        SCNText(
            initials,
            style: textStyle,
            weight: .medium,
            color: .mutedForeground
        )
    }
}

#Preview {
    SCNComponentPreview {
        HStack(spacing: SCNTheme.shared.spacing.s3) {
            SCNAvatar(
                initials: "A",
                size: .sm
            )
            SCNAvatar(initials: "NS")
            SCNAvatar(
                initials: "UI",
                size: .lg
            )
        }
    }
}
