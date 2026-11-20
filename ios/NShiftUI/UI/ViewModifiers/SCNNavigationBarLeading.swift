import SwiftUI

enum SCNNavigationBarLeading {
    case none
    case back(action: (() -> Void)? = nil)
    case image(Image)
    case button(
        icon: SCNIconName,
        action: () -> Void
    )
}
