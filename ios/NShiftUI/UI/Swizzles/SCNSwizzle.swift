import UIKit

@MainActor
final class SCNSwizzle {
    private init() {}

    static func install() {
        SCNNavigationItemSwizzle.install()
        SCNViewControllerSwizzle.install()
    }
}
