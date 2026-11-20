import SwiftUI

struct SCNAvatar: View {
    @EnvironmentObject private var theme: SCNTheme

    enum Size {
        case sm
        case `default`
        case lg
    }

    private let initials: String
    private let size: Size

    private var side: CGFloat {
        switch size {
        case .sm: return theme.spacing.s6
        case .default: return theme.spacing.s8
        case .lg: return theme.spacing.s10
        }
    }

    private var textStyle: SCNText.Style {
        size == .lg ? .sm : .xs
    }

    init(
        initials: String,
        size: Size = .default
    ) {
        self.initials = initials
        self.size = size
    }

    var body: some View {
        SCNText(
            initials,
            style: textStyle,
            weight: .medium,
            color: .mutedForeground
        )
            .frame(
                width: side,
                height: side
            )
            .background(theme.palette.muted)
            .clipShape(Circle())
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
