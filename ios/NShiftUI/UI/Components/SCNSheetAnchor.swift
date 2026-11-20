import UIKit

@available(iOS 16.0, *)
final class SCNSheetAnchor: UIView {
    var onWindowChange: (() -> Void)?

    override func didMoveToWindow() {
        super.didMoveToWindow()
        onWindowChange?()
    }
}
