import ObjectiveC
import UIKit

@MainActor
final class SCNViewControllerSwizzle {
    private init() {}

    private static var attachedHostingTypes = Set<ObjectIdentifier>()

    static func install() {
        _ = canvasSwizzled
        attachToExistingHostingControllers()
    }

    private static func attachToExistingHostingControllers() {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        for scene in scenes {
            for window in scene.windows where window.windowLevel <= .normal {
                guard let root = window.rootViewController else {
                    continue
                }
                attachToHostingControllers(in: root)
            }
        }
    }

    private static func attachToHostingControllers(in controller: UIViewController) {
        if isHosting(controller) {
            attach(to: type(of: controller))
            controller.view.setNeedsLayout()
        }
        for child in controller.children {
            attachToHostingControllers(in: child)
        }
        if let presented = controller.presentedViewController {
            attachToHostingControllers(in: presented)
        }
    }

    private static func attach(to type: AnyClass) {
        let identifier = ObjectIdentifier(type)
        guard attachedHostingTypes.insert(identifier).inserted else {
            return
        }
        let loadSelector = #selector(UIViewController.scn_viewDidLoad)
        let layoutSelector = #selector(UIViewController.scn_viewDidLayoutSubviews)
        let appearanceSelector = #selector(UIViewController.scn_viewDidAppear(_:))
        guard
            let loadMethod = class_getInstanceMethod(
                UIViewController.self,
                loadSelector
            ),
            let layoutMethod = class_getInstanceMethod(
                UIViewController.self,
                layoutSelector
            ),
            let appearanceMethod = class_getInstanceMethod(
                UIViewController.self,
                appearanceSelector
            )
        else {
            return
        }
        attachWrapper(
            type: type,
            original: #selector(UIViewController.viewDidLoad),
            swizzled: loadSelector,
            wrapper: method_getImplementation(loadMethod),
            encoding: method_getTypeEncoding(loadMethod)
        )
        attachWrapper(
            type: type,
            original: #selector(UIViewController.viewDidLayoutSubviews),
            swizzled: layoutSelector,
            wrapper: method_getImplementation(layoutMethod),
            encoding: method_getTypeEncoding(layoutMethod)
        )
        attachWrapper(
            type: type,
            original: #selector(UIViewController.viewDidAppear(_:)),
            swizzled: appearanceSelector,
            wrapper: method_getImplementation(appearanceMethod),
            encoding: method_getTypeEncoding(appearanceMethod)
        )
    }

    private static let canvasSwizzled: Void = {
        let loadSelector = #selector(UIViewController.scn_viewDidLoad)
        let layoutSelector = #selector(UIViewController.scn_viewDidLayoutSubviews)
        let appearanceSelector = #selector(UIViewController.scn_viewDidAppear(_:))
        guard
            let loadSwizzle = class_getInstanceMethod(
                UIViewController.self,
                loadSelector
            ),
            let layoutSwizzle = class_getInstanceMethod(
                UIViewController.self,
                layoutSelector
            ),
            let appearanceSwizzle = class_getInstanceMethod(
                UIViewController.self,
                appearanceSelector
            ),
            let loadEncoding = method_getTypeEncoding(loadSwizzle),
            let layoutEncoding = method_getTypeEncoding(layoutSwizzle),
            let appearanceEncoding = method_getTypeEncoding(appearanceSwizzle)
        else {
            return
        }
        let loadIMP = method_getImplementation(loadSwizzle)
        let layoutIMP = method_getImplementation(layoutSwizzle)
        let appearanceIMP = method_getImplementation(appearanceSwizzle)
        swizzleOnClass(
            UIViewController.self,
            original: #selector(UIViewController.viewDidLoad),
            swizzled: loadSelector
        )
        swizzleOnClass(
            UIViewController.self,
            original: #selector(UIViewController.viewDidLayoutSubviews),
            swizzled: layoutSelector
        )
        swizzleOnClass(
            UIViewController.self,
            original: #selector(UIViewController.viewDidAppear(_:)),
            swizzled: appearanceSelector
        )
        for name in ["_UIHostingController", "UIHostingController"] {
            guard let type = NSClassFromString(name) else {
                continue
            }
            attachWrapper(
                type: type,
                original: #selector(UIViewController.viewDidLoad),
                swizzled: loadSelector,
                wrapper: loadIMP,
                encoding: loadEncoding
            )
            attachWrapper(
                type: type,
                original: #selector(UIViewController.viewDidLayoutSubviews),
                swizzled: layoutSelector,
                wrapper: layoutIMP,
                encoding: layoutEncoding
            )
            attachWrapper(
                type: type,
                original: #selector(UIViewController.viewDidAppear(_:)),
                swizzled: appearanceSelector,
                wrapper: appearanceIMP,
                encoding: appearanceEncoding
            )
        }
    }()

    private static func swizzleOnClass(
        _ type: AnyClass,
        original originalSelector: Selector,
        swizzled swizzledSelector: Selector
    ) {
        guard
            let originalMethod = class_getInstanceMethod(
                type,
                originalSelector
            ),
            let swizzledMethod = class_getInstanceMethod(
                type,
                swizzledSelector
            )
        else {
            return
        }
        method_exchangeImplementations(
            originalMethod,
            swizzledMethod
        )
    }

    private static func attachWrapper(
        type: AnyClass,
        original originalSelector: Selector,
        swizzled swizzledSelector: Selector,
        wrapper: IMP,
        encoding: UnsafePointer<CChar>?
    ) {
        class_addMethod(
            type,
            swizzledSelector,
            wrapper,
            encoding
        )
        guard
            let originalMethod = class_getInstanceMethod(
                type,
                originalSelector
            ),
            let swizzledMethod = class_getInstanceMethod(
                type,
                swizzledSelector
            ),
            let swizzledEncoding = method_getTypeEncoding(swizzledMethod),
            let originalEncoding = method_getTypeEncoding(originalMethod)
        else {
            return
        }
        let added = class_addMethod(
            type,
            originalSelector,
            method_getImplementation(swizzledMethod),
            swizzledEncoding
        )
        if added {
            class_replaceMethod(
                type,
                swizzledSelector,
                method_getImplementation(originalMethod),
                originalEncoding
            )
        } else {
            method_exchangeImplementations(
                originalMethod,
                swizzledMethod
            )
        }
    }

    fileprivate static func isHosting(_ controller: UIViewController) -> Bool {
        if let hosting = NSClassFromString("UIHostingController"),
            controller.isKind(of: hosting) {
            return true
        }
        if let hosting = NSClassFromString("_UIHostingController"),
            controller.isKind(of: hosting) {
            return true
        }
        return NSStringFromClass(type(of: controller)).contains("HostingController")
    }
}

extension UIViewController {
    @objc
    fileprivate func scn_viewDidLoad() {
        scn_viewDidLoad()
        scn_applyCanvas()
    }

    @objc
    fileprivate func scn_viewDidLayoutSubviews() {
        scn_viewDidLayoutSubviews()
        scn_applyCanvas()
    }

    @objc
    fileprivate func scn_viewDidAppear(_ animated: Bool) {
        scn_viewDidAppear(animated)
        scn_applyCanvas()
    }

    private func scn_applyCanvas() {
        guard SCNViewControllerSwizzle.isHosting(self) else {
            return
        }
        SCNNavigationChrome.lockTitles(near: view)
        if isPresentedAsBottomSheet {
            return
        }
        guard let window = view.window,
            window.windowLevel <= .normal
        else {
            return
        }
        let canvas = SCNTheme.shared.backgroundUIColor
        view.backgroundColor = canvas
        view.isOpaque = true
        for subview in view.subviews {
            if subview is UINavigationBar || subview is UIToolbar {
                continue
            }
            subview.backgroundColor = .clear
            subview.isOpaque = false
        }
        window.backgroundColor = canvas
    }

    private var isPresentedAsBottomSheet: Bool {
        var current: UIViewController? = self
        while let controller = current {
            if controller.presentingViewController != nil,
                controller.sheetPresentationController != nil {
                return true
            }
            current = controller.parent
        }
        return false
    }
}
