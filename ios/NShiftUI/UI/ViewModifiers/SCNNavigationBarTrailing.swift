import Foundation

enum SCNNavigationBarTrailing {
    case none
    case close(action: (() -> Void)? = nil)
    case button(
        icon: SCNIconName,
        action: () -> Void
    )
}
