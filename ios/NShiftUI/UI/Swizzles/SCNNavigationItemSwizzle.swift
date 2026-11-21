import Combine
import ObjectiveC
import UIKit

@MainActor
enum SCNNavigationChrome {
    fileprivate enum TitleRole: Hashable {
        case inline
        case large
        case subtitle
        case largeSubtitle

        var textStyle: UIFont.TextStyle {
            switch self {
            case .inline:
                return .headline
            case .large:
                return .largeTitle
            case .subtitle:
                return .subheadline
            case .largeSubtitle:
                return .body
            }
        }

        var weight: UIFont.Weight {
            switch self {
            case .inline:
                return .semibold
            case .large:
                return .bold
            case .subtitle, .largeSubtitle:
                return .regular
            }
        }

        var usesSubtitleColor: Bool {
            switch self {
            case .inline, .large:
                return false
            case .subtitle, .largeSubtitle:
                return true
            }
        }
    }

    private final class Store: @unchecked Sendable {
        static let shared = Store()

        private let lock = NSLock()
        private var family = "Geist"
        private var titleColor = UIColor.label
        private var subtitleColor = UIColor.secondaryLabel
        private var background = UIColor.systemBackground
        private var inline = UIFont.preferredFont(forTextStyle: .headline)
        private var large = UIFont.preferredFont(forTextStyle: .largeTitle)
        private var subtitle = UIFont.preferredFont(forTextStyle: .subheadline)
        private var largeSubtitle = UIFont.preferredFont(forTextStyle: .body)

        func publish(
            family: String,
            titleColor: UIColor,
            subtitleColor: UIColor,
            background: UIColor
        ) {
            let inline = Self.baseFont(
                family: family,
                style: .headline,
                weight: .semibold
            )
            let large = Self.baseFont(
                family: family,
                style: .largeTitle,
                weight: .bold
            )
            let subtitle = Self.baseFont(
                family: family,
                style: .subheadline,
                weight: .regular
            )
            let largeSubtitle = Self.baseFont(
                family: family,
                style: .body,
                weight: .regular
            )
            lock.lock()
            self.family = family
            self.titleColor = titleColor
            self.subtitleColor = subtitleColor
            self.background = background
            self.inline = inline
            self.large = large
            self.subtitle = subtitle
            self.largeSubtitle = largeSubtitle
            lock.unlock()
        }

        func currentTitleColor() -> UIColor {
            lock.lock()
            defer { lock.unlock() }
            return titleColor
        }

        func currentSubtitleColor() -> UIColor {
            lock.lock()
            defer { lock.unlock() }
            return subtitleColor
        }

        func currentBackground() -> UIColor {
            lock.lock()
            defer { lock.unlock() }
            return background
        }

        func baseFont(for role: TitleRole) -> UIFont {
            lock.lock()
            defer { lock.unlock() }
            switch role {
            case .inline:
                return inline
            case .large:
                return large
            case .subtitle:
                return subtitle
            case .largeSubtitle:
                return largeSubtitle
            }
        }

        private static func baseFont(
            family: String,
            style: UIFont.TextStyle,
            weight: UIFont.Weight
        ) -> UIFont {
            let traits = UITraitCollection(preferredContentSizeCategory: .large)
            let size = UIFont.preferredFont(
                forTextStyle: style,
                compatibleWith: traits
            ).pointSize
            guard let named = UIFont(name: family, size: size) else {
                return UIFont.systemFont(
                    ofSize: size,
                    weight: weight
                )
            }
            let variations: [NSNumber: NSNumber] = [
                NSNumber(value: 0x77676874): NSNumber(value: axis(weight))
            ]
            let descriptor = named.fontDescriptor.addingAttributes([
                UIFontDescriptor.AttributeName(rawValue: "NSCTFontVariationAttribute"): variations,
                .traits: [
                    UIFontDescriptor.TraitKey.weight: weight
                ]
            ])
            let weighted = UIFont(
                descriptor: descriptor,
                size: size
            )
            let familyMatches = weighted.familyName.compare(
                named.familyName,
                options: .caseInsensitive
            ) == .orderedSame
                || weighted.fontName.localizedCaseInsensitiveContains(family)
            return familyMatches ? weighted : named
        }

        private static func axis(_ weight: UIFont.Weight) -> CGFloat {
            switch weight {
            case .ultraLight:
                return 100
            case .thin:
                return 200
            case .light:
                return 300
            case .regular:
                return 400
            case .medium:
                return 500
            case .semibold:
                return 600
            case .bold:
                return 700
            case .heavy:
                return 800
            case .black:
                return 900
            default:
                return 400
            }
        }
    }

    fileprivate static var forcing = false
    private static var lockingBars = Set<ObjectIdentifier>()
    private static var fontCache: [TitleRole: UIFont] = [:]
    private static var fontCacheCategory: UIContentSizeCategory?

    static func publish(_ theme: SCNTheme) {
        fontCache.removeAll()
        fontCacheCategory = nil
        let palette = theme.palette
        Store.shared.publish(
            family: theme.fontFamily,
            titleColor: palette.foregroundUIColor,
            subtitleColor: palette.mutedForegroundUIColor,
            background: palette.backgroundUIColor
        )
    }

    static var titleColor: UIColor {
        Store.shared.currentTitleColor()
    }

    static var subtitleColor: UIColor {
        Store.shared.currentSubtitleColor()
    }

    static var barBackground: UIColor {
        Store.shared.currentBackground()
    }

    static func lockTitles(near view: UIView) {
        for bar in navigationBars(near: view) {
            let identifier = ObjectIdentifier(bar)
            guard lockingBars.insert(identifier).inserted else {
                continue
            }
            defer {
                lockingBars.remove(identifier)
            }
            lockAppearancesIfNeeded(on: bar)
            lockLabels(on: bar)
        }
    }

    static func reassert(on bar: UINavigationBar) {
        forcing = true
        defer {
            forcing = false
        }
        let identifier = ObjectIdentifier(bar)
        lockingBars.insert(identifier)
        defer {
            lockingBars.remove(identifier)
        }
        stamp(bar.standardAppearance, fallbackOpaque: true) { stamped in
            bar.standardAppearance = stamped
        }
        if let compact = bar.compactAppearance {
            stamp(compact, fallbackOpaque: true) { stamped in
                bar.compactAppearance = stamped
            }
        }
        if let scrolled = bar.scrollEdgeAppearance {
            stamp(scrolled, fallbackOpaque: false) { stamped in
                bar.scrollEdgeAppearance = stamped
            }
        }
        if let compactScrolled = bar.compactScrollEdgeAppearance {
            stamp(compactScrolled, fallbackOpaque: false) { stamped in
                bar.compactScrollEdgeAppearance = stamped
            }
        }
        bar.titleTextAttributes = attributes(for: .inline)
        bar.largeTitleTextAttributes = attributes(for: .large)
        bar.tintColor = titleColor
        if let item = bar.topItem {
            reassert(item)
        }
        lockLabels(on: bar)
    }

    fileprivate static func attributes(
        for role: TitleRole
    ) -> [NSAttributedString.Key: Any] {
        [
            .font: font(for: role),
            .foregroundColor: color(for: role)
        ]
    }

    fileprivate static func locking(
        _ attributes: [NSAttributedString.Key: Any],
        role: TitleRole
    ) -> [NSAttributedString.Key: Any] {
        if !forcing, isLocked(attributes, role: role) {
            return attributes
        }
        var next = attributes
        next[.font] = font(for: role)
        next[.foregroundColor] = color(for: role)
        return next
    }

    fileprivate static func locking(
        _ title: NSAttributedString?,
        role: TitleRole
    ) -> NSAttributedString? {
        guard let title, title.length > 0 else {
            return title
        }
        if !forcing, isLocked(title, role: role) {
            return title
        }
        let next = NSMutableAttributedString(attributedString: title)
        next.addAttributes(
            attributes(for: role),
            range: NSRange(
                location: 0,
                length: next.length
            )
        )
        return next
    }

    fileprivate static func titlesAreLocked(
        _ appearance: UINavigationBarAppearance
    ) -> Bool {
        if !isLocked(appearance.titleTextAttributes, role: .inline) {
            return false
        }
        if !isLocked(appearance.largeTitleTextAttributes, role: .large) {
            return false
        }
        guard #available(iOS 26.0, *) else {
            return true
        }
        if !isLocked(appearance.subtitleTextAttributes, role: .subtitle) {
            return false
        }
        if !isLocked(appearance.largeSubtitleTextAttributes, role: .largeSubtitle) {
            return false
        }
        return true
    }

    private static func font(for role: TitleRole) -> UIFont {
        let category = UITraitCollection.current.preferredContentSizeCategory
        if fontCacheCategory != category {
            fontCache.removeAll()
            fontCacheCategory = category
        }
        if let cached = fontCache[role] {
            return cached
        }
        let scaled = UIFontMetrics(forTextStyle: role.textStyle).scaledFont(
            for: Store.shared.baseFont(for: role)
        )
        fontCache[role] = scaled
        return scaled
    }

    private static func color(for role: TitleRole) -> UIColor {
        role.usesSubtitleColor ? subtitleColor : titleColor
    }

    private static func isLocked(
        _ attributes: [NSAttributedString.Key: Any],
        role: TitleRole
    ) -> Bool {
        guard
            let currentFont = attributes[.font] as? UIFont,
            let currentColor = attributes[.foregroundColor] as? UIColor
        else {
            return false
        }
        return currentFont == font(for: role)
            && currentColor.isEqual(color(for: role))
    }

    private static func isLocked(
        _ title: NSAttributedString,
        role: TitleRole
    ) -> Bool {
        guard title.length > 0 else {
            return true
        }
        let attributes = title.attributes(
            at: 0,
            effectiveRange: nil
        )
        return isLocked(attributes, role: role)
    }

    private static func lockAppearancesIfNeeded(on bar: UINavigationBar) {
        if !titlesAreLocked(bar.standardAppearance) || bar.tintColor != titleColor {
            reassert(on: bar)
            return
        }
        if let compact = bar.compactAppearance, !titlesAreLocked(compact) {
            reassert(on: bar)
            return
        }
        if let scrolled = bar.scrollEdgeAppearance, !titlesAreLocked(scrolled) {
            reassert(on: bar)
            return
        }
        if let compactScrolled = bar.compactScrollEdgeAppearance,
            !titlesAreLocked(compactScrolled) {
            reassert(on: bar)
        }
    }

    private static func stamp(
        _ appearance: UINavigationBarAppearance,
        fallbackOpaque: Bool,
        apply: (UINavigationBarAppearance) -> Void
    ) {
        apply(
            SCNNavigationItemSwizzle.stamped(
                appearance,
                fallbackOpaque: fallbackOpaque
            )
        )
    }

    private static func reassert(_ item: UINavigationItem) {
        if let standard = item.standardAppearance {
            item.standardAppearance = SCNNavigationItemSwizzle.stamped(
                standard,
                fallbackOpaque: true
            )
        }
        if let compact = item.compactAppearance {
            item.compactAppearance = SCNNavigationItemSwizzle.stamped(
                compact,
                fallbackOpaque: true
            )
        }
        if let scrolled = item.scrollEdgeAppearance {
            item.scrollEdgeAppearance = SCNNavigationItemSwizzle.stamped(
                scrolled,
                fallbackOpaque: false
            )
        }
        if let compactScrolled = item.compactScrollEdgeAppearance {
            item.compactScrollEdgeAppearance = SCNNavigationItemSwizzle.stamped(
                compactScrolled,
                fallbackOpaque: false
            )
        }
        guard #available(iOS 26.0, *) else {
            return
        }
        item.attributedTitle = item.attributedTitle
        item.attributedSubtitle = item.attributedSubtitle
        item.largeAttributedSubtitle = item.largeAttributedSubtitle
    }

    private static func lockLabels(on bar: UINavigationBar) {
        lockLabels(in: bar, bar: bar)
    }

    private static func lockLabels(
        in view: UIView,
        bar: UINavigationBar
    ) {
        if let label = view as? UILabel, let role = role(of: label, in: bar) {
            let font = font(for: role)
            let color = color(for: role)
            if label.font != font {
                label.font = font
            }
            if forcing || !(label.textColor?.isEqual(color) ?? false) {
                label.textColor = color
            }
        }
        for subview in view.subviews {
            lockLabels(in: subview, bar: bar)
        }
    }

    private static func role(
        of label: UILabel,
        in bar: UINavigationBar
    ) -> TitleRole? {
        if containedInControl(label, until: bar) {
            return nil
        }
        let names = classNames(from: label, until: bar).joined(separator: " ")
        if names.contains("Large") && names.contains("Subtitle") {
            return .largeSubtitle
        }
        if names.contains("Subtitle") {
            return .subtitle
        }
        if names.contains("Large") {
            return .large
        }
        if names.contains("Title") {
            return .inline
        }
        guard let text = label.text, !text.isEmpty, let item = bar.topItem else {
            return nil
        }
        if #available(iOS 26.0, *) {
            if text == item.largeSubtitle {
                return .largeSubtitle
            }
            if text == item.subtitle {
                return .subtitle
            }
            if text == item.largeTitle {
                return .large
            }
        }
        guard text == item.title else {
            return nil
        }
        return label.font.pointSize >= 28 ? .large : .inline
    }

    private static func containedInControl(
        _ view: UIView,
        until bar: UIView
    ) -> Bool {
        var current = view.superview
        while let node = current, node !== bar {
            if node is UIControl {
                return true
            }
            current = node.superview
        }
        return false
    }

    private static func classNames(
        from view: UIView,
        until bar: UIView
    ) -> [String] {
        var names: [String] = []
        var current: UIView? = view
        while let node = current, node !== bar {
            names.append(NSStringFromClass(type(of: node)))
            current = node.superview
        }
        return names
    }

    private static func navigationBars(near view: UIView) -> [UINavigationBar] {
        var bars: [UINavigationBar] = []
        var seen = Set<ObjectIdentifier>()
        var current: UIView? = view
        var depth = 0
        while let node = current, depth < 12 {
            collectBars(in: node, bars: &bars, seen: &seen)
            current = node.superview
            depth += 1
        }
        return bars
    }

    private static func collectBars(
        in view: UIView,
        bars: inout [UINavigationBar],
        seen: inout Set<ObjectIdentifier>
    ) {
        if let bar = view as? UINavigationBar {
            let identifier = ObjectIdentifier(bar)
            if seen.insert(identifier).inserted {
                bars.append(bar)
            }
        }
        for subview in view.subviews {
            if let bar = subview as? UINavigationBar {
                let identifier = ObjectIdentifier(bar)
                if seen.insert(identifier).inserted {
                    bars.append(bar)
                }
            }
            for child in subview.subviews {
                if let bar = child as? UINavigationBar {
                    let identifier = ObjectIdentifier(bar)
                    if seen.insert(identifier).inserted {
                        bars.append(bar)
                    }
                }
            }
        }
    }
}

@MainActor
final class SCNNavigationItemSwizzle {
    private init() {}

    private static var themeObserver: AnyCancellable?

    static func install() {
        _ = appearancesSwizzled
        refreshForThemeChange()
        guard themeObserver == nil else {
            return
        }
        themeObserver = SCNTheme.shared.$revision
            .dropFirst()
            .sink { _ in
                refreshForThemeChange()
            }
    }

    static func refreshForThemeChange() {
        SCNNavigationChrome.publish(SCNTheme.shared)
        applyGlobalBarAppearance()
        for bar in liveNavigationBars() {
            SCNNavigationChrome.reassert(on: bar)
            bar.setNeedsLayout()
        }
    }

    static func transparentAppearance() -> UINavigationBarAppearance {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithTransparentBackground()
        return appearance
    }

    static func stamped(
        _ appearance: UINavigationBarAppearance?,
        fallbackOpaque: Bool
    ) -> UINavigationBarAppearance {
        let next = appearance?.copy() ?? UINavigationBarAppearance()
        let preserveFill = keepsTranslucentFill(next)
        if !preserveFill && (fallbackOpaque || !isTransparent(next)) {
            next.configureWithOpaqueBackground()
            next.backgroundColor = SCNNavigationChrome.barBackground
            next.backgroundEffect = nil
        }
        next.shadowColor = UIColor.clear
        next.shadowImage = UIImage()
        next.titleTextAttributes = SCNNavigationChrome.locking(
            next.titleTextAttributes,
            role: .inline
        )
        next.largeTitleTextAttributes = SCNNavigationChrome.locking(
            next.largeTitleTextAttributes,
            role: .large
        )
        if #available(iOS 26.0, *) {
            next.subtitleTextAttributes = SCNNavigationChrome.locking(
                next.subtitleTextAttributes,
                role: .subtitle
            )
            next.largeSubtitleTextAttributes = SCNNavigationChrome.locking(
                next.largeSubtitleTextAttributes,
                role: .largeSubtitle
            )
        }
        return next
    }

    private static let appearancesSwizzled: Void = {
        let appearancePairs: [(Selector, Selector)] = [
            (
                #selector(setter: UINavigationBarAppearance.titleTextAttributes),
                #selector(UINavigationBarAppearance.scn_setTitleTextAttributes(_:))
            ),
            (
                #selector(setter: UINavigationBarAppearance.largeTitleTextAttributes),
                #selector(UINavigationBarAppearance.scn_setLargeTitleTextAttributes(_:))
            )
        ]
        for pair in appearancePairs {
            exchange(
                UINavigationBarAppearance.self,
                original: pair.0,
                swizzled: pair.1
            )
        }
        if #available(iOS 26.0, *) {
            exchange(
                UINavigationBarAppearance.self,
                original: #selector(setter: UINavigationBarAppearance.subtitleTextAttributes),
                swizzled: #selector(UINavigationBarAppearance.scn_setSubtitleTextAttributes(_:))
            )
            exchange(
                UINavigationBarAppearance.self,
                original: #selector(setter: UINavigationBarAppearance.largeSubtitleTextAttributes),
                swizzled: #selector(UINavigationBarAppearance.scn_setLargeSubtitleTextAttributes(_:))
            )
        }
        let itemPairs: [(Selector, Selector)] = [
            (
                #selector(setter: UINavigationItem.standardAppearance),
                #selector(UINavigationItem.scn_setStandardAppearance(_:))
            ),
            (
                #selector(setter: UINavigationItem.compactAppearance),
                #selector(UINavigationItem.scn_setCompactAppearance(_:))
            ),
            (
                #selector(setter: UINavigationItem.scrollEdgeAppearance),
                #selector(UINavigationItem.scn_setScrollEdgeAppearance(_:))
            ),
            (
                #selector(setter: UINavigationItem.compactScrollEdgeAppearance),
                #selector(UINavigationItem.scn_setCompactScrollEdgeAppearance(_:))
            )
        ]
        for pair in itemPairs {
            exchange(
                UINavigationItem.self,
                original: pair.0,
                swizzled: pair.1
            )
        }
        if #available(iOS 26.0, *) {
            exchange(
                UINavigationItem.self,
                original: NSSelectorFromString("setAttributedTitle:"),
                swizzled: #selector(UINavigationItem.scn_setAttributedTitle(_:))
            )
            exchange(
                UINavigationItem.self,
                original: NSSelectorFromString("setAttributedSubtitle:"),
                swizzled: #selector(UINavigationItem.scn_setAttributedSubtitle(_:))
            )
            exchange(
                UINavigationItem.self,
                original: NSSelectorFromString("setLargeAttributedSubtitle:"),
                swizzled: #selector(UINavigationItem.scn_setLargeAttributedSubtitle(_:))
            )
        }
        let barPairs: [(Selector, Selector)] = [
            (
                #selector(setter: UINavigationBar.titleTextAttributes),
                #selector(UINavigationBar.scn_setTitleTextAttributes(_:))
            ),
            (
                #selector(setter: UINavigationBar.largeTitleTextAttributes),
                #selector(UINavigationBar.scn_setLargeTitleTextAttributes(_:))
            )
        ]
        for pair in barPairs {
            exchange(
                UINavigationBar.self,
                original: pair.0,
                swizzled: pair.1
            )
        }
    }()

    private static func exchange(
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

    private static func applyGlobalBarAppearance() {
        let standard = stamped(
            nil,
            fallbackOpaque: true
        )
        let scrolled = stamped(
            transparentAppearance(),
            fallbackOpaque: false
        )
        let bar = UINavigationBar.appearance()
        bar.standardAppearance = standard
        bar.compactAppearance = standard
        bar.scrollEdgeAppearance = scrolled
        bar.compactScrollEdgeAppearance = scrolled
        bar.titleTextAttributes = SCNNavigationChrome.attributes(for: .inline)
        bar.largeTitleTextAttributes = SCNNavigationChrome.attributes(for: .large)
        bar.tintColor = SCNNavigationChrome.titleColor
    }

    private static func keepsTranslucentFill(
        _ appearance: UINavigationBarAppearance
    ) -> Bool {
        guard let color = appearance.backgroundColor else {
            return false
        }
        let resolved = color.resolvedColor(
            with: UITraitCollection.current
        )
        let alpha = resolved.cgColor.alpha
        return alpha > 0.01 && alpha < 0.99
    }

    private static func isTransparent(_ appearance: UINavigationBarAppearance) -> Bool {
        if appearance.backgroundColor?.isEqual(SCNNavigationChrome.barBackground) == true {
            return false
        }
        if appearance.backgroundEffect != nil {
            return false
        }
        guard let color = appearance.backgroundColor else {
            return true
        }
        let resolved = color.resolvedColor(
            with: UITraitCollection(userInterfaceStyle: .light)
        )
        return resolved.cgColor.alpha < 0.01
    }

    private static func liveNavigationBars() -> [UINavigationBar] {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        var bars: [UINavigationBar] = []
        for scene in scenes {
            for window in scene.windows where window.windowLevel <= .normal {
                collectBars(in: window, into: &bars)
            }
        }
        return bars
    }

    private static func collectBars(
        in view: UIView,
        into bars: inout [UINavigationBar]
    ) {
        if let bar = view as? UINavigationBar {
            bars.append(bar)
        }
        for subview in view.subviews {
            collectBars(
                in: subview,
                into: &bars
            )
        }
    }
}

extension UINavigationBarAppearance {
    @objc
    fileprivate func scn_setTitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]
    ) {
        scn_setTitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes,
                role: .inline
            )
        )
    }

    @objc
    fileprivate func scn_setLargeTitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]
    ) {
        scn_setLargeTitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes,
                role: .large
            )
        )
    }

    @objc
    fileprivate func scn_setSubtitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]
    ) {
        scn_setSubtitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes,
                role: .subtitle
            )
        )
    }

    @objc
    fileprivate func scn_setLargeSubtitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]
    ) {
        scn_setLargeSubtitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes,
                role: .largeSubtitle
            )
        )
    }
}

extension UINavigationItem {
    @objc
    fileprivate func scn_setStandardAppearance(_ appearance: UINavigationBarAppearance?) {
        scn_setStandardAppearance(
            SCNNavigationItemSwizzle.stamped(
                appearance,
                fallbackOpaque: true
            )
        )
    }

    @objc
    fileprivate func scn_setCompactAppearance(_ appearance: UINavigationBarAppearance?) {
        scn_setCompactAppearance(
            SCNNavigationItemSwizzle.stamped(
                appearance,
                fallbackOpaque: true
            )
        )
    }

    @objc
    fileprivate func scn_setScrollEdgeAppearance(_ appearance: UINavigationBarAppearance?) {
        scn_setScrollEdgeAppearance(
            SCNNavigationItemSwizzle.stamped(
                appearance,
                fallbackOpaque: false
            )
        )
    }

    @objc
    fileprivate func scn_setCompactScrollEdgeAppearance(_ appearance: UINavigationBarAppearance?) {
        scn_setCompactScrollEdgeAppearance(
            SCNNavigationItemSwizzle.stamped(
                appearance,
                fallbackOpaque: false
            )
        )
    }

    @objc
    fileprivate func scn_setAttributedTitle(_ title: NSAttributedString?) {
        scn_setAttributedTitle(
            SCNNavigationChrome.locking(
                title,
                role: .inline
            )
        )
    }

    @objc
    fileprivate func scn_setAttributedSubtitle(_ title: NSAttributedString?) {
        scn_setAttributedSubtitle(
            SCNNavigationChrome.locking(
                title,
                role: .subtitle
            )
        )
    }

    @objc
    fileprivate func scn_setLargeAttributedSubtitle(_ title: NSAttributedString?) {
        scn_setLargeAttributedSubtitle(
            SCNNavigationChrome.locking(
                title,
                role: .largeSubtitle
            )
        )
    }
}

extension UINavigationBar {
    @objc
    fileprivate func scn_setTitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]?
    ) {
        scn_setTitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes ?? [:],
                role: .inline
            )
        )
    }

    @objc
    fileprivate func scn_setLargeTitleTextAttributes(
        _ attributes: [NSAttributedString.Key: Any]?
    ) {
        scn_setLargeTitleTextAttributes(
            SCNNavigationChrome.locking(
                attributes ?? [:],
                role: .large
            )
        )
    }
}
