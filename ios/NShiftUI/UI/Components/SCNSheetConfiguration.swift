import SwiftUI

struct SCNSheetConfiguration {
    var detents: [SCNSheetDetent]
    var largestUndimmedDetent: SCNSheetDetent?
    var prefersGrabberVisible: Bool
    var prefersScrollingExpandsWhenScrolledToEdge: Bool
    var prefersEdgeAttachedInCompactHeight: Bool
    var widthFollowsPreferredContentSizeWhenEdgeAttached: Bool
    var preferredCornerRadius: CGFloat?
    var preferredContentWidth: CGFloat?
    var prefersPageSizing: Bool
    var preferredPlacement: SCNSheetPlacement
    var centersOnSourceView: Bool
    var isModalInPresentation: Bool
    var backgroundColor: Color
    var detentMaterial: SCNSheetDetentMaterial?
    var grabberContentInset: CGFloat
    var adaptiveStyle: SCNSheetAdaptiveStyle?
    var motion: SCNSheetMotion
    var shouldDismiss: (() -> Bool)?
    var onWillDismiss: (() -> Void)?
    var onDidAttemptToDismiss: (() -> Void)?
    var onDetentChange: ((SCNSheetDetent) -> Void)?
    var onAdaptivePresentation: ((SCNSheetAdaptiveStyle) -> Void)?

    @MainActor
    init() {
        detents = [.content]
        largestUndimmedDetent = nil
        prefersGrabberVisible = true
        prefersScrollingExpandsWhenScrolledToEdge = true
        prefersEdgeAttachedInCompactHeight = false
        widthFollowsPreferredContentSizeWhenEdgeAttached = false
        preferredCornerRadius = nil
        preferredContentWidth = nil
        prefersPageSizing = true
        preferredPlacement = .automatic
        centersOnSourceView = false
        isModalInPresentation = false
        backgroundColor = .clear
        detentMaterial = nil
        grabberContentInset = 0
        adaptiveStyle = nil
        motion = .standard
        shouldDismiss = nil
        onWillDismiss = nil
        onDidAttemptToDismiss = nil
        onDetentChange = nil
        onAdaptivePresentation = nil
    }
}
