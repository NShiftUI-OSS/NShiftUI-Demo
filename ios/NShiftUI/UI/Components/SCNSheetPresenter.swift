import SwiftUI
import UIKit

@available(iOS 16.0, *)
struct SCNSheetPresenter<SheetContent: View>: UIViewRepresentable {
    @Binding var isPresented: Bool
    var selectedDetent: Binding<SCNSheetDetent?>?
    var configuration: SCNSheetConfiguration
    var onDismiss: (() -> Void)?
    var content: () -> SheetContent

    func makeUIView(context: Context) -> SCNSheetAnchor {
        let view = SCNSheetAnchor()
        view.isUserInteractionEnabled = false
        view.backgroundColor = .clear
        view.onWindowChange = { [weak coordinator = context.coordinator] in
            coordinator?.reconcile()
        }
        return view
    }

    func updateUIView(_ uiView: SCNSheetAnchor, context: Context) {
        context.coordinator.bind(
            isPresented: $isPresented,
            selectedDetent: selectedDetent,
            configuration: configuration,
            onDismiss: onDismiss,
            content: content,
            anchor: uiView
        )
        uiView.onWindowChange = { [weak coordinator = context.coordinator] in
            coordinator?.reconcile()
        }
        if context.coordinator.container != nil {
            context.coordinator.pushContent()
        }
        context.coordinator.reconcile()
    }

    static func dismantleUIView(_ uiView: SCNSheetAnchor, coordinator: Coordinator) {
        uiView.onWindowChange = nil
        coordinator.shutdown()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    @MainActor
    final class Coordinator {
        var isPresented = Binding.constant(false)
        var selectedDetent: Binding<SCNSheetDetent?>?
        var configuration = SCNSheetConfiguration()
        var onDismiss: (() -> Void)?
        var content: () -> SheetContent = { fatalError("Bottom sheet content was not set") }
        weak var anchor: UIView?
        var container: SCNSheetContainerController<SheetContent>?
        private var phase: Phase = .idle
        private var didRetryWindow = false

        enum Phase {
            case idle
            case presenting
            case presented
            case dismissing
        }

        func bind(
            isPresented: Binding<Bool>,
            selectedDetent: Binding<SCNSheetDetent?>?,
            configuration: SCNSheetConfiguration,
            onDismiss: (() -> Void)?,
            content: @escaping () -> SheetContent,
            anchor: UIView
        ) {
            self.isPresented = isPresented
            self.selectedDetent = selectedDetent
            self.configuration = configuration
            self.onDismiss = onDismiss
            self.content = content
            self.anchor = anchor
        }

        func reconcile() {
            guard anchor?.window != nil else {
                guard isPresented.wrappedValue, !didRetryWindow else { return }
                didRetryWindow = true
                Task { @MainActor [weak self] in
                    self?.reconcile()
                }
                return
            }
            didRetryWindow = false
            if isPresented.wrappedValue {
                if container == nil {
                    guard phase != .presenting else { return }
                    beginPresenting()
                } else if phase != .dismissing {
                    pushContent()
                }
            } else if container != nil, phase != .dismissing {
                phase = .dismissing
                beginDismissing()
            }
        }

        func pushContent() {
            guard let container, let anchor else { return }
            container.update(
                content: content(),
                configuration: configuration,
                selection: selectedDetent?.wrappedValue,
                sourceView: sourceView(for: anchor),
                width: availableWidth(from: anchor)
            )
            wire(container)
        }

        func shutdown() {
            container?.dismiss(animated: false)
            container = nil
            phase = .idle
        }

        private func beginPresenting() {
            guard isPresented.wrappedValue else {
                phase = .idle
                return
            }
            guard let anchor, let presenter = anchor.nearestViewController(), presenter.view.window != nil else {
                phase = .idle
                return
            }
            if let presented = presenter.presentedViewController, !presented.isBeingDismissed {
                phase = .idle
                return
            }
            phase = .presenting

            let container = SCNSheetContainerController(content: content())
            self.container = container
            wire(container)
            container.update(
                content: content(),
                configuration: configuration,
                selection: selectedDetent?.wrappedValue,
                sourceView: sourceView(for: anchor),
                width: availableWidth(from: anchor)
            )
            presenter.present(container, animated: true) { [weak self] in
                guard let self else { return }
                if self.isPresented.wrappedValue {
                    self.phase = .presented
                    self.pushContent()
                } else {
                    self.phase = .dismissing
                    self.beginDismissing()
                }
            }
        }

        private func beginDismissing() {
            guard let container, container.presentingViewController != nil, !container.isBeingDismissed else {
                finishDismiss(fromUser: false)
                return
            }
            container.dismiss(animated: true) { [weak self] in
                self?.finishDismiss(fromUser: false)
            }
        }

        private func finishDismiss(fromUser: Bool) {
            guard phase != .idle else { return }
            phase = .idle
            container = nil
            if fromUser {
                isPresented.wrappedValue = false
            }
            onDismiss?()
        }

        private func wire(_ container: SCNSheetContainerController<SheetContent>) {
            container.shouldDismiss = { [weak self] in
                self?.configuration.shouldDismiss?() ?? true
            }
            container.onWillDismiss = { [weak self] in
                self?.configuration.onWillDismiss?()
            }
            container.onDidAttemptToDismiss = { [weak self] in
                self?.configuration.onDidAttemptToDismiss?()
            }
            container.onAdaptivePresentation = { [weak self] style in
                self?.configuration.onAdaptivePresentation?(style)
            }
            container.onSelectedDetentChanged = { [weak self] detent in
                self?.selectedDetent?.wrappedValue = detent
                self?.configuration.onDetentChange?(detent)
            }
            container.onUserDismiss = { [weak self] in
                self?.finishDismiss(fromUser: true)
            }
        }

        private func sourceView(for anchor: UIView) -> UIView? {
            guard configuration.centersOnSourceView else { return nil }
            return anchor.nearestViewController()?.view
        }

        private func availableWidth(from anchor: UIView) -> CGFloat {
            if let width = anchor.window?.bounds.width, width > 1 {
                return width
            }
            if let width = anchor.window?.windowScene?.screen.bounds.width, width > 1 {
                return width
            }
            return anchor.bounds.width
        }
    }
}

private extension UIResponder {
    func nearestViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let current = responder {
            if let controller = current as? UIViewController {
                return controller
            }
            responder = current.next
        }
        return nil
    }
}

@available(iOS 16.0, *)
private struct SCNSheetModifier<SheetContent: View>: ViewModifier {
    @Binding var isPresented: Bool
    var selectedDetent: Binding<SCNSheetDetent?>?
    var configuration: SCNSheetConfiguration
    var onDismiss: (() -> Void)?
    var content: () -> SheetContent

    func body(content: Content) -> some View {
        content.background {
            SCNSheetPresenter(
                isPresented: $isPresented,
                selectedDetent: selectedDetent,
                configuration: configuration,
                onDismiss: onDismiss,
                content: self.content
            )
            .frame(width: 1, height: 1)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
    }
}

@available(iOS 16.0, *)
private struct SCNSheetItemModifier<Item: Identifiable, SheetContent: View>: ViewModifier {
    @Binding var item: Item?
    var selectedDetent: Binding<SCNSheetDetent?>?
    var configuration: SCNSheetConfiguration
    var onDismiss: (() -> Void)?
    var content: (Item) -> SheetContent
    @State private var cachedItem: Item?

    func body(content: Content) -> some View {
        content
            .scnSheet(
                isPresented: Binding(
                    get: { item != nil },
                    set: { isPresented in
                        if !isPresented {
                            item = nil
                        }
                    }
                ),
                selectedDetent: selectedDetent,
                configuration: configuration,
                onDismiss: onDismiss
            ) {
                if let value = item ?? cachedItem {
                    self.content(value)
                }
            }
            .onChange(of: item?.id) { _ in
                if let item {
                    cachedItem = item
                }
            }
    }
}

@available(iOS 16.0, *)
extension View {
    /// Presents a UIKit bottom sheet. SwiftUI supplies the content and configuration only.
    func scnSheet<SheetContent: View>(
        isPresented: Binding<Bool>,
        selectedDetent: Binding<SCNSheetDetent?>? = nil,
        configuration: SCNSheetConfiguration = SCNSheetConfiguration(),
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> SheetContent
    ) -> some View {
        modifier(
            SCNSheetModifier(
                isPresented: isPresented,
                selectedDetent: selectedDetent,
                configuration: configuration,
                onDismiss: onDismiss,
                content: content
            )
        )
    }

    /// Presents a UIKit bottom sheet for a non-nil identifiable item.
    func scnSheet<Item: Identifiable, SheetContent: View>(
        item: Binding<Item?>,
        selectedDetent: Binding<SCNSheetDetent?>? = nil,
        configuration: SCNSheetConfiguration = SCNSheetConfiguration(),
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder content: @escaping (Item) -> SheetContent
    ) -> some View {
        modifier(
            SCNSheetItemModifier(
                item: item,
                selectedDetent: selectedDetent,
                configuration: configuration,
                onDismiss: onDismiss,
                content: content
            )
        )
    }
}
