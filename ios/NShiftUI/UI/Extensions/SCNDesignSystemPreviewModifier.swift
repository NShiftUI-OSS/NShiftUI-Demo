import SwiftUI

@available(
    iOS 18.0,
    *
)
struct SCNDesignSystemPreviewModifier: PreviewModifier {
    typealias Context = Void

    func body(
        content: Content,
        context: Void
    ) -> some View {
        content.themeSync()
    }
}
