import SwiftUI

@available(
    iOS 18.0,
    *
)
extension PreviewTrait where T == Preview.ViewTraits {
    @MainActor static var designSystem: Self {
        .modifier(SCNDesignSystemPreviewModifier())
    }
}
