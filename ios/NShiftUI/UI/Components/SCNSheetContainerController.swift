import SwiftUI
import UIKit

/// Presents SwiftUI content with `UISheetPresentationController`.
///
/// SwiftUI animates the layout with the theme motion. The sheet plays
/// that same curve once, so Core Animation interpolates the frame.
@available(iOS 16.0, *)
final class SCNSheetContainerController<Content: View>: UIViewController, UISheetPresentationControllerDelegate {
    private let heightRelay = SCNSheetHeightRelay()
    private let hostingController: UIHostingController<SCNSheetRoot<Content>>

    private var configuration = SCNSheetConfiguration()
    private var sourceView: UIView?
    private var appliedOptions: SCNSheetOptions?
    private var lastAppliedSelection: SCNSheetDetent?
    private var measuredContentHeight: CGFloat = 0
    private var heightTarget: CGFloat = 0
    private var hasAppeared = false
    private var heightAnimator: UIViewPropertyAnimator?

    var shouldDismiss: () -> Bool = { true }
    var onWillDismiss: () -> Void = {}
    var onDidAttemptToDismiss: () -> Void = {}
    var onSelectedDetentChanged: (SCNSheetDetent) -> Void = { _ in }
    var onAdaptivePresentation: (SCNSheetAdaptiveStyle) -> Void = { _ in }
    var onUserDismiss: () -> Void = {}

    init(content: Content) {
        hostingController = UIHostingController(
            rootView: SCNSheetRoot(
                grabberInset: 0,
                content: content,
                relay: heightRelay,
                animation: SCNSheetMotion.standard.animation
            )
        )
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .pageSheet
        hostingController.sizingOptions = []
        if #available(iOS 16.4, *) {
            hostingController.safeAreaRegions = []
        }
        hostingController.view.backgroundColor = .clear
        hostingController.view.clipsToBounds = true
        hostingController.view.setContentCompressionResistancePriority(.defaultLow, for: .vertical)
        hostingController.view.setContentHuggingPriority(.defaultLow, for: .vertical)
        heightRelay.onChange = { [weak self] height in
            self?.noteContentHeight(height)
        }
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = SCNTheme.shared.backgroundUIColor
        view.clipsToBounds = true
        addChild(hostingController)
        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hostingController.view)
        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        hostingController.didMove(toParent: self)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        hasAppeared = true
        if measuredContentHeight < 2 {
            let estimated = estimateHeight(width: currentWidth)
            if estimated > 1 {
                noteContentHeight(estimated)
            }
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if isBeingDismissed || presentingViewController == nil {
            heightAnimator?.stopAnimation(true)
            heightAnimator = nil
            heightTarget = measuredContentHeight
        }
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        view.backgroundColor = SCNTheme.shared.backgroundUIColor
    }

    func update(
        content: Content,
        configuration: SCNSheetConfiguration,
        selection: SCNSheetDetent?,
        sourceView: UIView?,
        width: CGFloat
    ) {
        self.configuration = configuration
        self.sourceView = sourceView
        let root = SCNSheetRoot(
            grabberInset: effectiveGrabberInset,
            content: content,
            relay: heightRelay,
            animation: configuration.motion.animation
        )
        // Replacing rootView after presentation throws away the in-flight
        // SwiftUI insertion animation and snaps every row into place.
        if presentingViewController == nil {
            hostingController.rootView = root
        }
        view.backgroundColor = SCNTheme.shared.backgroundUIColor
        isModalInPresentation = configuration.isModalInPresentation

        if measuredContentHeight < 2 {
            let estimated = estimateHeight(width: width, content: content)
            if estimated > 1 {
                measuredContentHeight = estimated
                heightTarget = estimated
            }
        }

        let options = SCNSheetOptions(configuration)
        if options != appliedOptions {
            appliedOptions = options
            applyChrome(animated: hasAppeared && presentingViewController != nil)
        }
        applySelection(selection)
        publishPreferredContentSize(width: width)
    }

    func noteContentHeight(_ height: CGFloat) {
        let next = resolvedContentHeight(ceil(height))
        guard next > 1, abs(next - heightTarget) >= 1 else { return }
        let previous = measuredContentHeight
        heightTarget = next
        measuredContentHeight = next
        let canAnimate = hasAppeared
            && presentingViewController != nil
            && !isBeingPresented
            && !isBeingDismissed
            && previous > 1
            && isShowingContentDetent
        guard canAnimate, let sheet = sheetPresentationController else {
            UIView.performWithoutAnimation {
                self.sheetPresentationController?.invalidateDetents()
            }
            return
        }
        animateDetent(on: sheet)
    }

    /// Resizes the detent once, using the active timing. `animateChanges` keeps
    /// the sheet's own layout intact; invalidating every frame drops the frame rate.
    private func animateDetent(on sheet: UISheetPresentationController) {
        heightAnimator?.stopAnimation(true)
        let animator = UIViewPropertyAnimator(
            duration: configuration.motion.duration,
            timingParameters: configuration.motion.timing
        )
        animator.isInterruptible = true
        animator.addAnimations {
            sheet.animateChanges {
                sheet.invalidateDetents()
            }
        }
        animator.addCompletion { [weak self] position in
            guard let self, position == .end else { return }
            self.heightAnimator = nil
        }
        heightAnimator = animator
        animator.startAnimation()
    }

    private var effectiveGrabberInset: CGFloat {
        configuration.prefersGrabberVisible ? max(configuration.grabberContentInset, 0) : 0
    }

    private var currentWidth: CGFloat {
        if view.bounds.width > 1 {
            return view.bounds.width
        }
        return view.window?.bounds.width ?? view.bounds.width
    }

    private var isShowingContentDetent: Bool {
        guard let identifier = sheetPresentationController?.selectedDetentIdentifier else { return true }
        return identifier == SCNSheetDetent.content.uiKitIdentifier
    }

    private func pushDetentHeight() {
        guard let sheet = sheetPresentationController else { return }
        let detents = makeDetents()
        let identifiers = detents.map(\.identifier)
        if sheet.detents.map(\.identifier) != identifiers {
            sheet.detents = detents
        } else {
            sheet.invalidateDetents()
        }
    }

    private func applyChrome(animated: Bool) {
        guard let sheet = sheetPresentationController else { return }
        performChanges(animated: animated) {
            sheet.prefersGrabberVisible = configuration.prefersGrabberVisible
            sheet.prefersScrollingExpandsWhenScrolledToEdge = configuration.prefersScrollingExpandsWhenScrolledToEdge
            sheet.prefersEdgeAttachedInCompactHeight = configuration.prefersEdgeAttachedInCompactHeight
            sheet.widthFollowsPreferredContentSizeWhenEdgeAttached = configuration.widthFollowsPreferredContentSizeWhenEdgeAttached
            sheet.preferredCornerRadius = configuration.preferredCornerRadius
            sheet.sourceView = configuration.centersOnSourceView ? sourceView : nil
            if #available(iOS 17.0, *) {
                sheet.prefersPageSizing = configuration.prefersPageSizing
            }
            if #available(iOS 27.0, *) {
                sheet.preferredPlacement = configuration.preferredPlacement.uiKitPlacement
            }
            installDetents(preservingSelection: true)
            applyUndimmed(on: sheet)
            if let selection = lastAppliedSelection {
                sheet.selectedDetentIdentifier = selection.uiKitIdentifier
            }
        }
        sheet.delegate = self
    }

    private func applySelection(_ selection: SCNSheetDetent?) {
        guard selection != lastAppliedSelection else { return }
        lastAppliedSelection = selection
        guard let sheet = sheetPresentationController else { return }
        performChanges(animated: hasAppeared && presentingViewController != nil && !isBeingPresented) {
            sheet.selectedDetentIdentifier = selection?.uiKitIdentifier
        }
    }

    private func installDetents(preservingSelection: Bool) {
        guard let sheet = sheetPresentationController else { return }
        let selected = preservingSelection ? sheet.selectedDetentIdentifier : nil
        let detents = makeDetents()
        let identifiers = detents.map(\.identifier)
        if sheet.detents.map(\.identifier) != identifiers {
            sheet.detents = detents
        } else {
            sheet.invalidateDetents()
        }
        if let selected, identifiers.contains(selected) {
            sheet.selectedDetentIdentifier = selected
        }
        applyUndimmed(on: sheet)
    }

    private func applyUndimmed(on sheet: UISheetPresentationController) {
        sheet.largestUndimmedDetentIdentifier = configuration.largestUndimmedDetent?.uiKitIdentifier
    }

    private func performChanges(animated: Bool, _ changes: () -> Void) {
        guard let sheet = sheetPresentationController else {
            changes()
            return
        }
        if animated {
            sheet.animateChanges(changes)
        } else {
            changes()
        }
    }

    private func publishPreferredContentSize(width: CGFloat) {
        guard measuredContentHeight > 1, width > 1 else { return }
        let resolvedWidth = configuration.preferredContentWidth ?? width
        let size = CGSize(width: resolvedWidth, height: measuredContentHeight)
        guard preferredContentSize != size else { return }
        preferredContentSize = size
    }

    private func makeDetents() -> [UISheetPresentationController.Detent] {
        let maxHeight = view.window?.bounds.height ?? view.bounds.height
        let ordered = normalizedDetents().sorted { lhs, rhs in
            let left = lhs.ordering(maxHeight: maxHeight, contentHeight: measuredContentHeight)
            let right = rhs.ordering(maxHeight: maxHeight, contentHeight: measuredContentHeight)
            if left.height != right.height {
                return left.height < right.height
            }
            return left.tieBreak < right.tieBreak
        }

        var seen = Set<String>()
        let detents = ordered.compactMap { detent -> UISheetPresentationController.Detent? in
            guard seen.insert(detent.identifier).inserted else { return nil }
            return styled(uiKitDetent(for: detent))
        }
        return detents.isEmpty ? [styled(.large())] : detents
    }

    private func normalizedDetents() -> [SCNSheetDetent] {
        configuration.detents.isEmpty ? [.content] : configuration.detents
    }

    private func uiKitDetent(for detent: SCNSheetDetent) -> UISheetPresentationController.Detent {
        switch detent {
        case .medium:
            return .medium()
        case .large:
            return .large()
        case .fraction(let value):
            let fraction = min(max(value, 0), 1)
            return .custom(identifier: detent.uiKitIdentifier) { context in
                context.maximumDetentValue * fraction
            }
        case .height(let value):
            let height = max(value, 1)
            return .custom(identifier: detent.uiKitIdentifier) { context in
                min(height, context.maximumDetentValue)
            }
        case .content:
            return .custom(identifier: detent.uiKitIdentifier) { [weak self] context in
                let height = self?.measuredContentHeight ?? 1
                guard height > 1 else { return 1 }
                return min(height, context.maximumDetentValue)
            }
        }
    }

    private func styled(_ detent: UISheetPresentationController.Detent) -> UISheetPresentationController.Detent {
        guard #available(iOS 26.1, *) else {
            return detent
        }
        if let material = configuration.detentMaterial {
            detent.backgroundEffect = material.makeEffect()
        } else {
            detent.backgroundEffect = UIColorEffect(color: SCNTheme.shared.backgroundUIColor)
        }
        return detent
    }

    /// The flexible sheet root can report the container height on the first layout.
    /// When that happens, use a tight offscreen measurement of the SwiftUI content.
    private func resolvedContentHeight(_ reported: CGFloat) -> CGFloat {
        let screen = view.window?.bounds.height ?? view.bounds.height
        guard screen > 1, reported > screen * 0.9 else { return reported }
        let fitted = estimateHeight(width: currentWidth)
        guard fitted > 1, fitted < reported - 80 else { return reported }
        return fitted
    }

    private func estimateHeight(width: CGFloat, content: Content? = nil) -> CGFloat {
        let resolvedWidth = width > 1 ? width : currentWidth
        let root = SCNSheetHeightProbe(
            grabberInset: effectiveGrabberInset,
            content: content ?? hostingController.rootView.content
        )
        let probe = UIHostingController(rootView: root)
        probe.sizingOptions = [.intrinsicContentSize]
        if #available(iOS 16.4, *) {
            probe.safeAreaRegions = []
        }
        probe.view.bounds = CGRect(x: 0, y: 0, width: resolvedWidth, height: 1)
        probe.view.setNeedsLayout()
        probe.view.layoutIfNeeded()

        let fitted = probe.sizeThatFits(in: CGSize(width: resolvedWidth, height: 0))
        let intrinsic = probe.view.intrinsicContentSize.height
        let candidates = [fitted.height, intrinsic].filter { $0.isFinite && $0 > 1 && $0 < 7_500 }
        guard let best = candidates.min() else { return 0 }
        return ceil(best)
    }

    func sheetPresentationControllerDidChangeSelectedDetentIdentifier(_ sheetPresentationController: UISheetPresentationController) {
        guard
            let identifier = sheetPresentationController.selectedDetentIdentifier,
            let detent = normalizedDetents().first(where: { $0.uiKitIdentifier == identifier })
        else {
            return
        }
        lastAppliedSelection = detent
        onSelectedDetentChanged(detent)
    }

    func adaptivePresentationStyle(for controller: UIPresentationController) -> UIModalPresentationStyle {
        configuration.adaptiveStyle?.modalStyle ?? .none
    }

    func adaptivePresentationStyle(
        for controller: UIPresentationController,
        traitCollection: UITraitCollection
    ) -> UIModalPresentationStyle {
        adaptivePresentationStyle(for: controller)
    }

    func presentationController(
        _ presentationController: UIPresentationController,
        willPresentWithAdaptiveStyle style: UIModalPresentationStyle,
        transitionCoordinator: UIViewControllerTransitionCoordinator?
    ) {
        guard let mapped = SCNSheetAdaptiveStyle(style) else { return }
        onAdaptivePresentation(mapped)
    }

    func presentationControllerShouldDismiss(_ presentationController: UIPresentationController) -> Bool {
        shouldDismiss()
    }

    func presentationControllerWillDismiss(_ presentationController: UIPresentationController) {
        onWillDismiss()
    }

    func presentationControllerDidDismiss(_ presentationController: UIPresentationController) {
        onUserDismiss()
    }

    func presentationControllerDidAttemptToDismiss(_ presentationController: UIPresentationController) {
        onDidAttemptToDismiss()
    }
}

@available(iOS 16.0, *)
private extension SCNSheetDetent {
    var uiKitIdentifier: UISheetPresentationController.Detent.Identifier {
        switch self {
        case .medium:
            return .medium
        case .large:
            return .large
        default:
            return UISheetPresentationController.Detent.Identifier(identifier)
        }
    }

    func ordering(maxHeight: CGFloat, contentHeight: CGFloat) -> (height: CGFloat, tieBreak: Int) {
        switch self {
        case .content:
            return (contentHeight > 1 ? contentHeight : 0, 0)
        case .height(let height):
            return (max(height, 0), 1)
        case .fraction(let value):
            return (maxHeight * min(max(value, 0), 1), 2)
        case .medium:
            return (maxHeight * 0.5, 3)
        case .large:
            return (maxHeight, 4)
        }
    }
}

@available(iOS 16.0, *)
private extension SCNSheetPlacement {
    @available(iOS 27.0, *)
    var uiKitPlacement: UISheetPresentationController.Placement {
        switch self {
        case .automatic:
            return .automatic
        case .leading:
            return .leading
        case .center:
            return .center
        case .trailing:
            return .trailing
        }
    }
}

@available(iOS 16.0, *)
private extension SCNSheetAdaptiveStyle {
    var modalStyle: UIModalPresentationStyle {
        switch self {
        case .none:
            return .none
        case .pageSheet:
            return .pageSheet
        case .formSheet:
            return .formSheet
        case .fullScreen:
            return .fullScreen
        case .overFullScreen:
            return .overFullScreen
        }
    }

    init?(_ style: UIModalPresentationStyle) {
        switch style {
        case .none:
            self = .none
        case .pageSheet:
            self = .pageSheet
        case .formSheet:
            self = .formSheet
        case .fullScreen:
            self = .fullScreen
        case .overFullScreen:
            self = .overFullScreen
        default:
            return nil
        }
    }
}

@available(iOS 16.0, *)
private extension SCNSheetDetentMaterial {
    @MainActor
    func makeEffect() -> UIVisualEffect {
        let style: UIBlurEffect.Style
        switch self {
        case .systemChrome:
            style = .systemChromeMaterial
        case .systemMaterial:
            style = .systemMaterial
        case .systemThinMaterial:
            style = .systemThinMaterial
        case .systemUltraThinMaterial:
            style = .systemUltraThinMaterial
        case .systemThickMaterial:
            style = .systemThickMaterial
        }
        return UIBlurEffect(style: style)
    }
}

private struct SCNSheetOptions: Equatable {
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
    var backgroundDescription: String
    var detentMaterial: SCNSheetDetentMaterial?
    var grabberContentInset: CGFloat
    var adaptiveStyle: SCNSheetAdaptiveStyle?

    init(_ configuration: SCNSheetConfiguration) {
        detents = configuration.detents
        largestUndimmedDetent = configuration.largestUndimmedDetent
        prefersGrabberVisible = configuration.prefersGrabberVisible
        prefersScrollingExpandsWhenScrolledToEdge = configuration.prefersScrollingExpandsWhenScrolledToEdge
        prefersEdgeAttachedInCompactHeight = configuration.prefersEdgeAttachedInCompactHeight
        widthFollowsPreferredContentSizeWhenEdgeAttached = configuration.widthFollowsPreferredContentSizeWhenEdgeAttached
        preferredCornerRadius = configuration.preferredCornerRadius
        preferredContentWidth = configuration.preferredContentWidth
        prefersPageSizing = configuration.prefersPageSizing
        preferredPlacement = configuration.preferredPlacement
        centersOnSourceView = configuration.centersOnSourceView
        isModalInPresentation = configuration.isModalInPresentation
        backgroundDescription = String(describing: configuration.backgroundColor)
        detentMaterial = configuration.detentMaterial
        grabberContentInset = configuration.grabberContentInset
        adaptiveStyle = configuration.adaptiveStyle
    }
}

private final class SCNSheetHeightRelay {
    var onChange: (CGFloat) -> Void = { _ in }
}

private struct SCNSheetHeightPreferenceKey: PreferenceKey {
    nonisolated static var defaultValue: CGFloat { 0 }

    nonisolated static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        let next = nextValue()
        if next > 0 {
            value = next
        }
    }
}

private struct SCNSheetHeightProbe<Content: View>: View {
    @ObservedObject private var theme = SCNTheme.shared
    var grabberInset: CGFloat
    var content: Content

    var body: some View {
        content
            .environmentObject(theme)
            .padding(.top, grabberInset)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .topLeading)
    }
}

private struct SCNSheetRoot<Content: View>: View {
    @ObservedObject private var theme = SCNTheme.shared
    var grabberInset: CGFloat
    var content: Content
    var relay: SCNSheetHeightRelay
    var animation: Animation

    var body: some View {
        content
            .environmentObject(theme)
            .padding(.top, grabberInset)
            .fixedSize(horizontal: false, vertical: true)
            .background(heightReader)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .onPreferenceChange(SCNSheetHeightPreferenceKey.self) { height in
                relay.onChange(height)
            }
            .transaction { transaction in
                if transaction.animation == nil {
                    transaction.animation = animation
                }
            }
    }

    private var heightReader: some View {
        GeometryReader { proxy in
            Color.clear.preference(key: SCNSheetHeightPreferenceKey.self, value: proxy.size.height)
        }
    }
}
