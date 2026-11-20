import SwiftUI

struct SCNSeparator: View {
    @EnvironmentObject private var theme: SCNTheme
    private let axis: Axis

    init(axis: Axis = .horizontal) {
        self.axis = axis
    }

    var body: some View {
        Rectangle()
            .fill(theme.palette.border)
            .frame(
                width: axis == .vertical ? theme.border.hairline : nil,
                height: axis == .horizontal ? theme.border.hairline : nil
            )
            .frame(
                maxWidth: axis == .horizontal ? .infinity : nil,
                maxHeight: axis == .vertical ? .infinity : nil
            )
    }
}

#Preview {
    SCNComponentPreview {
        SCNSeparator()
        HStack(spacing: SCNTheme.shared.spacing.s3) {
            SCNText("A")
            SCNSeparator(axis: .vertical)
                .frame(height: SCNTheme.shared.spacing.s6)
            SCNText("B")
        }
    }
}
