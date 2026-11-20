import SwiftUI

struct SCNComponentPreview<Content: View>: View {
    private let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        SCNPreviewChrome(content: content)
            .themeSync()
    }
}
