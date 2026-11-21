import SwiftUI
import UIKit

struct SCNNavigationBarModifier: ViewModifier {
    @EnvironmentObject private var theme: SCNTheme
    @Environment(\.dismiss) private var dismiss

    private let title: String
    private let size: SCNNavigationBarSize
    private let leading: SCNNavigationBarLeading
    private let center: Image?
    private let trailing: SCNNavigationBarTrailing
    private let isTranslucent: Bool
    private let background: Color?

    init(
        title: String,
        size: SCNNavigationBarSize,
        leading: SCNNavigationBarLeading,
        center: Image? = nil,
        trailing: SCNNavigationBarTrailing,
        isTranslucent: Bool,
        background: Color?
    ) {
        self.title = title
        self.size = size
        self.leading = leading
        self.center = center
        self.trailing = trailing
        self.isTranslucent = isTranslucent
        self.background = background
    }

    init(
        title: String,
        size: SCNNavigationBarSize,
        leading: SCNNavigationBarLeading,
        center: Image,
        trailing: SCNNavigationBarTrailing,
        isTranslucent: Bool,
        background: Color?
    ) {
        self.title = title
        self.size = size
        self.leading = leading
        self.center = center
        self.trailing = trailing
        self.isTranslucent = isTranslucent
        self.background = background
    }

    func body(content: Content) -> some View {
        legacy(content)
    }

    private var titleDisplayMode: NavigationBarItem.TitleDisplayMode {
        switch size {
        case .large:
            return .large
        case .inline:
            return .inline
        }
    }

    private var showsLeading: Bool {
        switch leading {
        case .none:
            return false
        case .back, .image, .button:
            return true
        }
    }

    private var showsTrailing: Bool {
        switch trailing {
        case .none:
            return false
        case .close, .button:
            return true
        }
    }
}

extension SCNNavigationBarModifier {
    @ViewBuilder
    private func legacy(_ content: Content) -> some View {
        let titled = applyAppearance(
            content
                .navigationBarTitleDisplayMode(titleDisplayMode)
                .navigationTitle(title)
        )
        let placed = barItems(titled)
        hideNativeBackButton(centered(placed))
    }

    @ViewBuilder
    private func centered<V: View>(_ view: V) -> some View {
        if let center {
            view.toolbar {
                ToolbarItem(placement: .principal) {
                    center
                        .renderingMode(.template)
                        .resizable()
                        .scaledToFit()
                        .frame(width: theme.spacing.s5, height: theme.spacing.s5)
                }
            }
        } else {
            view
        }
    }

    /// The design-system bar already draws the back control. Hide the system
    /// one without adding a SwiftUI toolbar back item.
    private func hideNativeBackButton<V: View>(_ view: V) -> some View {
        view
            .navigationBarBackButtonHidden(true)
            .background(SCNNavigationBarBackButtonHider())
    }

    @ViewBuilder
    private func barItems<V: View>(_ view: V) -> some View {
        if showsLeading && showsTrailing {
            view.navigationBarItems(
                leading: leadingControl,
                trailing: trailingControl
            )
        } else if showsLeading {
            view.navigationBarItems(leading: leadingControl)
        } else if showsTrailing {
            view.navigationBarItems(trailing: trailingControl)
        } else {
            view
        }
    }

    @ViewBuilder
    private func applyAppearance<V: View>(_ view: V) -> some View {
        if background != nil || isTranslucent {
            view.background(
                SCNNavigationBarAppearance(
                    isTranslucent: isTranslucent,
                    background: background
                )
            )
        } else {
            view
        }
    }
}

private struct SCNNavigationBarAppearance: UIViewControllerRepresentable {
    let isTranslucent: Bool
    let background: Color?

    func makeUIViewController(context: Context) -> Controller {
        Controller()
    }

    func updateUIViewController(_ controller: Controller, context: Context) {
        controller.isTranslucent = isTranslucent
        controller.background = background.map { UIColor($0) }
        controller.apply()
    }

    final class Controller: UIViewController {
        var isTranslucent = false
        var background: UIColor?

        override func didMove(toParent parent: UIViewController?) {
            super.didMove(toParent: parent)
            apply()
        }

        override func viewDidLayoutSubviews() {
            super.viewDidLayoutSubviews()
            apply()
        }

        func apply() {
            var current: UIViewController? = self
            var navigationController: UINavigationController?
            while let controller = current {
                if let navigation = controller.navigationController {
                    navigationController = navigation
                    break
                }
                current = controller.parent
            }
            guard let navigationController else { return }
            let bar = navigationController.navigationBar
            let appearance = UINavigationBarAppearance()
            if isTranslucent {
                appearance.configureWithTransparentBackground()
            } else {
                appearance.configureWithOpaqueBackground()
            }
            appearance.backgroundEffect = nil
            appearance.shadowColor = .clear
            appearance.shadowImage = UIImage()
            if let background {
                let alpha = isTranslucent ? Self.translucentAlpha : 1
                appearance.backgroundColor = Self.flat(
                    background,
                    alpha: alpha,
                    traits: bar.traitCollection
                )
                if isTranslucent {
                    navigationController.view.backgroundColor = Self.flat(
                        background,
                        alpha: 1,
                        traits: bar.traitCollection
                    )
                }
            }
            appearance.titleTextAttributes = [
                .font: UIFont.systemFont(ofSize: 17, weight: .semibold)
            ]
            appearance.largeTitleTextAttributes = [
                .font: UIFont.systemFont(ofSize: 34, weight: .bold)
            ]
            bar.isTranslucent = isTranslucent
            install(appearance, on: bar)
            if let item = bar.topItem {
                install(appearance, on: item)
                scnHideNativeBackButton(item)
            }
            scnHideNativeBackButton(from: self)
        }

        private func install(
            _ appearance: UINavigationBarAppearance,
            on bar: UINavigationBar
        ) {
            bar.standardAppearance = appearance
            bar.compactAppearance = appearance
            bar.scrollEdgeAppearance = appearance
            bar.compactScrollEdgeAppearance = appearance
        }

        private func install(
            _ appearance: UINavigationBarAppearance,
            on item: UINavigationItem
        ) {
            item.standardAppearance = appearance
            item.compactAppearance = appearance
            item.scrollEdgeAppearance = appearance
            item.compactScrollEdgeAppearance = appearance
        }

        private static let translucentAlpha: CGFloat = 0.4

        private static func flat(
            _ color: UIColor,
            alpha: CGFloat,
            traits: UITraitCollection
        ) -> UIColor {
            let resolved = color.resolvedColor(with: traits)
            var red: CGFloat = 0
            var green: CGFloat = 0
            var blue: CGFloat = 0
            var current: CGFloat = 0
            guard resolved.getRed(
                &red,
                green: &green,
                blue: &blue,
                alpha: &current
            ) else {
                return resolved.withAlphaComponent(alpha)
            }
            return UIColor(
                red: red,
                green: green,
                blue: blue,
                alpha: alpha
            )
        }
    }
}

extension SCNNavigationBarModifier {
    @ViewBuilder
    private var leadingControl: some View {
        switch leading {
        case .none:
            EmptyView()
        case .back(let action):
            barButton(
                icon: .arrowLeft,
                action: action ?? { dismiss() }
            )
        case .image(let image):
            image
                .resizable()
                .scaledToFill()
                .frame(
                    width: theme.spacing.s8,
                    height: theme.spacing.s8
                )
                .clipShape(Circle())
        case .button(
            let icon,
            let action
        ):
            barButton(
                icon: icon,
                action: action
            )
        }
    }
}

extension SCNNavigationBarModifier {
    @ViewBuilder
    private var trailingControl: some View {
        switch trailing {
        case .none:
            EmptyView()
        case .close(let action):
            barButton(
                icon: .x,
                action: action ?? { dismiss() }
            )
        case .button(
            let icon,
            let action
        ):
            barButton(
                icon: icon,
                action: action
            )
        }
    }
}

extension SCNNavigationBarModifier {
    private func barButton(
        icon: SCNIconName,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(uiImage: toolbarGlyph(icon, pointSize: theme.spacing.s5))
        }
    }

    /// Liquid glass sizes a bar button from the image's intrinsic size.
    /// `SCNIcon` is a resizable PDF, so that size is empty and only the glass remains.
    private func toolbarGlyph(_ icon: SCNIconName, pointSize: CGFloat) -> UIImage {
        let side = max(pointSize, 1)
        let canvas = CGSize(width: side, height: side)
        let format = UIGraphicsImageRendererFormat.preferred()
        format.opaque = false
        let renderer = UIGraphicsImageRenderer(size: canvas, format: format)
        let rendered = renderer.image { _ in
            UIImage(named: icon.rawValue)?.draw(in: CGRect(origin: .zero, size: canvas))
        }
        return rendered.withRenderingMode(.alwaysTemplate)
    }
}

/// Keeps `UINavigationItem.hidesBackButton` set while our bar is on screen.
private struct SCNNavigationBarBackButtonHider: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> Controller {
        Controller()
    }

    func updateUIViewController(_ controller: Controller, context: Context) {
        controller.hideNativeBackButton()
    }

    final class Controller: UIViewController {
        private var reapplied = false

        override func viewDidLoad() {
            super.viewDidLoad()
            view.isUserInteractionEnabled = false
            view.backgroundColor = .clear
        }

        override func didMove(toParent parent: UIViewController?) {
            super.didMove(toParent: parent)
            hideNativeBackButton()
        }

        override func viewWillAppear(_ animated: Bool) {
            super.viewWillAppear(animated)
            hideNativeBackButton()
        }

        override func viewDidAppear(_ animated: Bool) {
            super.viewDidAppear(animated)
            hideNativeBackButton()
            guard reapplied == false else { return }
            reapplied = true
            Task { @MainActor [weak self] in
                self?.hideNativeBackButton()
            }
        }

        override func viewDidLayoutSubviews() {
            super.viewDidLayoutSubviews()
            hideNativeBackButton()
        }

        func hideNativeBackButton() {
            scnHideNativeBackButton(from: self)
        }
    }
}

@MainActor
private func scnHideNativeBackButton(_ item: UINavigationItem) {
    let supplemented = item.leftItemsSupplementBackButton
    if supplemented {
        item.leftItemsSupplementBackButton = false
    }
    guard supplemented || item.hidesBackButton == false else { return }
    item.hidesBackButton = true
    item.setHidesBackButton(true, animated: false)
}

@MainActor
private func scnHideNativeBackButton(from controller: UIViewController) {
    var current: UIViewController? = controller
    var navigationController: UINavigationController?
    while let node = current {
        if let navigation = node.navigationController {
            navigationController = navigation
            break
        }
        current = node.parent
    }
    guard
        let navigationController,
        let top = navigationController.topViewController
    else { return }
    var ancestor: UIViewController? = controller
    while let node = ancestor {
        if node === top {
            if let item = navigationController.navigationBar.topItem {
                scnHideNativeBackButton(item)
            }
            scnHideNativeBackButton(top.navigationItem)
            return
        }
        ancestor = node.parent
    }
}

private struct SCNNavigationBarPreview: View {
    var body: some View {
        NavigationView {
            List {
                SCNText("Row")
            }
            .scnNavigationBar(
                title: "Navigation",
                size: .large
            )
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

#Preview {
    SCNComponentPreview {
        SCNNavigationBarPreview()
    }
}
