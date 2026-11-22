import NShiftUI
import SwiftUI
import UIKit

@NShiftMetadata
struct TabMetadata: NShiftMetadata, Decodable {
    let title: String
    let icon: String
    let route: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? ""
        let raw = try container.decodeIfPresent(String.self, forKey: .route) ?? ""
        route = raw.hasPrefix(".") ? String(raw.dropFirst()) : raw
    }

    private enum CodingKeys: String, CodingKey {
        case title
        case icon
        case route
    }
}

@NShiftPlugin(
    name: "Tab",
    version: "1.0.0",
    metadata: TabMetadata.self
)
struct TabPlugin: NShiftPlugin {
    var body: some View {
        EmptyView()
    }
}

@NShiftPlugin(
    name: "TabBar",
    version: "1.0.0"
)
struct TabBarPlugin: NShiftPlugin {
    var body: some View {
        EmptyView()
    }
}

private struct TabBarHostedKey: EnvironmentKey {
    static let defaultValue = false
}

extension EnvironmentValues {
    var tabBarHosted: Bool {
        get { self[TabBarHostedKey.self] }
        set { self[TabBarHostedKey.self] = newValue }
    }
}

struct TabChromeReport: @unchecked Sendable {
    let report: (ScreenNavigationBarMetadata) -> Void
}

private struct TabChromeReportKey: EnvironmentKey {
    static let defaultValue: TabChromeReport? = nil
}

extension EnvironmentValues {
    var tabChromeReport: TabChromeReport? {
        get { self[TabChromeReportKey.self] }
        set { self[TabChromeReportKey.self] = newValue }
    }
}

struct TabRouteScreen: View {
    let route: String
    var onChrome: (ScreenNavigationBarMetadata) -> Void

    var body: some View {
        let name = route.trimmingCharacters(in: .whitespacesAndNewlines)
        if name.isEmpty {
            Color.clear
        } else {
            Screen()
                .url(NShiftAppConfiguration.current.runtimeScreenURL(for: name))
                .title(name)
                .resolve()
                .environment(\.tabBarHosted, true)
                .environment(\.tabChromeReport, TabChromeReport(report: onChrome))
        }
    }
}

func tabBarItems(in children: [NShiftPluginModel], hosted: Bool) -> [TabMetadata] {
    guard hosted == false,
          let bar = children.first(where: { $0.name.rawValue == "TabBar" })
    else {
        return []
    }
    return bar.children.compactMap { child in
        child.metadata?.unwrap(as: TabMetadata.self)
    }
}

struct NativeTabBarColors: UIViewControllerRepresentable {
    let primary: UIColor
    let muted: UIColor
    let background: UIColor

    func makeUIViewController(context: Context) -> Painter {
        Painter(primary: primary, muted: muted, background: background)
    }

    func updateUIViewController(_ painter: Painter, context: Context) {
        painter.primary = primary
        painter.muted = muted
        painter.background = background
        painter.paint()
    }

    final class Painter: UIViewController {
        var primary: UIColor
        var muted: UIColor
        var background: UIColor

        init(primary: UIColor, muted: UIColor, background: UIColor) {
            self.primary = primary
            self.muted = muted
            self.background = background
            super.init(nibName: nil, bundle: nil)
        }

        @available(*, unavailable)
        required init?(coder: NSCoder) {
            nil
        }

        override func viewDidLoad() {
            super.viewDidLoad()
            view.backgroundColor = .clear
            view.isUserInteractionEnabled = false
        }

        override func viewDidAppear(_ animated: Bool) {
            super.viewDidAppear(animated)
            paint()
        }

        override func viewDidLayoutSubviews() {
            super.viewDidLayoutSubviews()
            paint()
        }

        func paint() {
            guard let tabBar = nearestTabBar(from: view) else { return }
            if tabBar.tintColor?.cgColor == primary.cgColor,
               tabBar.unselectedItemTintColor?.cgColor == muted.cgColor,
               tabBar.standardAppearance.backgroundColor?.cgColor == background.cgColor {
                return
            }
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = background
            paint(appearance.stackedLayoutAppearance)
            paint(appearance.inlineLayoutAppearance)
            paint(appearance.compactInlineLayoutAppearance)
            tabBar.standardAppearance = appearance
            tabBar.scrollEdgeAppearance = appearance
            tabBar.tintColor = primary
            tabBar.unselectedItemTintColor = muted
            for item in tabBar.items ?? [] {
                item.setTitleTextAttributes([.foregroundColor: muted], for: .normal)
                item.setTitleTextAttributes([.foregroundColor: primary], for: .selected)
                item.image = item.image?.withRenderingMode(.alwaysTemplate)
                item.selectedImage = (item.selectedImage ?? item.image)?
                    .withRenderingMode(.alwaysTemplate)
            }
        }

        private func paint(_ layout: UITabBarItemAppearance) {
            layout.normal.iconColor = muted
            layout.normal.titleTextAttributes = [.foregroundColor: muted]
            layout.selected.iconColor = primary
            layout.selected.titleTextAttributes = [.foregroundColor: primary]
        }

        private func nearestTabBar(from view: UIView?) -> UITabBar? {
            var current = view
            while let node = current {
                if let bar = node as? UITabBar { return bar }
                if let found = tabBar(in: node.subviews) { return found }
                current = node.superview
            }
            return nil
        }

        private func tabBar(in views: [UIView]) -> UITabBar? {
            for view in views {
                if let bar = view as? UITabBar { return bar }
                if let found = tabBar(in: view.subviews) { return found }
            }
            return nil
        }
    }
}

func tabBarUIColor(_ color: Color, style: UIUserInterfaceStyle) -> UIColor {
    UIColor(color).resolvedColor(
        with: UITraitCollection(userInterfaceStyle: style)
    )
}

func tabBarIcon(_ name: String) -> UIImage? {
    UIImage(named: name)?.withRenderingMode(.alwaysTemplate)
}
