import NShiftUI
import SwiftUI

struct ScreenNavigationBarMetadata: Decodable, Hashable, Sendable {
    let title: String
    let theme: String
    let leading: String
    let leadingIcon: String
    let trailing: String
    let trailingIcon: String
    let background: String
    let centerIcon: String

    init(
        title: String = "",
        theme: String = "neutral",
        leading: String = "auto",
        leadingIcon: String = "",
        trailing: String = "none",
        trailingIcon: String = "",
        background: String = "",
        centerIcon: String = ""
    ) {
        self.title = title
        self.theme = theme
        self.leading = leading
        self.leadingIcon = leadingIcon
        self.trailing = trailing
        self.trailingIcon = trailingIcon
        self.background = background
        self.centerIcon = centerIcon
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        theme = try container.decodeIfPresent(String.self, forKey: .theme) ?? "neutral"
        leading = try container.decodeIfPresent(String.self, forKey: .leading) ?? "auto"
        leadingIcon = try container.decodeIfPresent(String.self, forKey: .leadingIcon) ?? ""
        trailing = try container.decodeIfPresent(String.self, forKey: .trailing) ?? "none"
        trailingIcon = try container.decodeIfPresent(String.self, forKey: .trailingIcon) ?? ""
        background = try container.decodeIfPresent(String.self, forKey: .background) ?? ""
        centerIcon = try container.decodeIfPresent(String.self, forKey: .centerIcon) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case title
        case theme
        case leading
        case leadingIcon
        case trailing
        case trailingIcon
        case background
        case centerIcon
    }
}

struct ScreenScrollMetadata: Decodable, Hashable, Sendable {
    let enabled: Bool
    let fastRefresh: Bool

    init(enabled: Bool = false, fastRefresh: Bool = false) {
        self.enabled = enabled
        self.fastRefresh = fastRefresh
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        enabled = try container.decodeIfPresent(Bool.self, forKey: .enabled) ?? false
        fastRefresh = try container.decodeIfPresent(Bool.self, forKey: .fastRefresh) ?? false
    }

    private enum CodingKeys: String, CodingKey {
        case enabled
        case fastRefresh
    }
}

@NShiftMetadata
struct ScreenMetadata: NShiftMetadata, Decodable {
    let navigationBar: ScreenNavigationBarMetadata?
    let scroll: ScreenScrollMetadata?

    init(
        navigationBar: ScreenNavigationBarMetadata? = nil,
        scroll: ScreenScrollMetadata? = nil
    ) {
        self.navigationBar = navigationBar
        self.scroll = scroll
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        navigationBar = try container.decodeIfPresent(
            ScreenNavigationBarMetadata.self,
            forKey: .navigationBar
        )
        scroll = try container.decodeIfPresent(
            ScreenScrollMetadata.self,
            forKey: .scroll
        )
    }

    private enum CodingKeys: String, CodingKey {
        case navigationBar
        case scroll
    }
}

@NShiftSlotKey
enum ScreenSlot: NShiftSlotKey {
    case bottomSheet
    case tabBar
}

@NShiftPlugin(
    name: "Screen",
    version: "1.0.0",
    metadata: ScreenMetadata.self,
    slots: ScreenSlot.self
)
struct ScreenPlugin: NShiftPluginContainer {
    @StateObject var viewModel: ScreenViewModel
    @EnvironmentObject private var theme: SCNTheme
    @Environment(\.screenRefresh) private var screenRefresh
    @Environment(\.tabBarHosted) private var tabBarHosted
    @Environment(\.tabChromeReport) private var tabChromeReport
    @State private var selectedTab = 0
    @State private var chromeByRoute: [String: ScreenNavigationBarMetadata] = [:]

    var body: some View {
        Group {
            if tabBarHosted {
                hostedBody
            } else {
                styled(content, bar: displayedBar)
            }
        }
        .onAppear {
            viewModel.bind(refresh: screenRefresh)
            tabChromeReport?.report(navigationBar)
        }
        .onChange(of: navigationBar) { bar in
            tabChromeReport?.report(bar)
        }
    }

    private var hostedBody: some View {
        content
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .background(slots(.bottomSheet))
            .background {
                theme.palette.background
                    .ignoresSafeArea()
            }
    }

    private func styled<Content: View>(
        _ content: Content,
        bar: ScreenNavigationBarMetadata
    ) -> some View {
        content
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .background(slots(.bottomSheet))
            .scnNavigationBar(
                title: bar.title,
                leading: leading(for: bar),
                center: centerIcon(for: bar),
                trailing: trailing(for: bar),
                isTranslucent: true,
                background: barBackground(for: bar)
            )
            .background {
                theme.palette.background
                    .ignoresSafeArea()
            }
    }

    @ViewBuilder
    private var content: some View {
        let slotTabs = tabBarItems(in: slotModels(.tabBar), hosted: tabBarHosted)
        let tabs = slotTabs.isEmpty
            ? tabBarItems(in: pluginChildren, hosted: tabBarHosted)
            : slotTabs
        if tabs.isEmpty {
            screenBody
        } else {
            TabView(selection: $selectedTab) {
                screenBody
                    .tabItem { tabLabel(tabs[0]) }
                    .tag(0)
                ForEach(Array(tabs.dropFirst().enumerated()), id: \.offset) { offset, item in
                    TabRouteScreen(route: item.route) { bar in
                        guard chromeByRoute[item.route] != bar else { return }
                        chromeByRoute[item.route] = bar
                    }
                    .tabItem { tabLabel(item) }
                    .tag(offset + 1)
                }
            }
            .accentColor(theme.palette.primary)
            .background(
                NativeTabBarColors(
                    primary: tabBarUIColor(theme.palette.primary, style: theme.interfaceStyle),
                    muted: tabBarUIColor(theme.palette.mutedForeground, style: theme.interfaceStyle),
                    background: tabBarUIColor(theme.palette.background, style: theme.interfaceStyle)
                )
            )
        }
    }

    @ViewBuilder
    private var screenBody: some View {
        let fastRefresh = metadata.scroll?.fastRefresh == true
        if metadata.scroll?.enabled == true || fastRefresh {
            GeometryReader { geometry in
                ScrollView(.vertical) {
                    pageChildren
                        .frame(
                            maxWidth: .infinity,
                            minHeight: geometry.size.height,
                            alignment: .center
                        )
                }
                .modifier(
                    FastRefreshModifier(enabled: fastRefresh) {
                        await viewModel.refresh()
                    }
                )
                .frame(
                    maxWidth: .infinity,
                    maxHeight: .infinity
                )
            }
        } else {
            pageChildren
                .frame(
                    maxWidth: .infinity,
                    maxHeight: .infinity,
                    alignment: .center
                )
        }
    }

    @ViewBuilder
    private var pageChildren: some View {
        children { model, view in
            if model.name.rawValue != "TabBar" {
                view
            }
        }
    }

    @ViewBuilder
    private func tabLabel(_ item: TabMetadata) -> some View {
        let icon = tabBarIcon(item.icon)
        return Label {
            Text(item.title)
        } icon: {
            if let icon {
                Image(uiImage: icon)
            } else {
                Image(systemName: "circle")
            }
        }
    }

    private var navigationBar: ScreenNavigationBarMetadata {
        metadata.navigationBar ?? .init()
    }

    private var displayedBar: ScreenNavigationBarMetadata {
        let slotTabs = tabBarItems(in: slotModels(.tabBar), hosted: tabBarHosted)
        let tabs = slotTabs.isEmpty
            ? tabBarItems(in: pluginChildren, hosted: tabBarHosted)
            : slotTabs
        guard selectedTab > 0, selectedTab < tabs.count else {
            return navigationBar
        }
        let tab = tabs[selectedTab]
        return chromeByRoute[tab.route] ?? ScreenNavigationBarMetadata(
            title: tab.title,
            theme: navigationBar.theme
        )
    }

    private func leading(for bar: ScreenNavigationBarMetadata) -> SCNNavigationBarLeading {
        if let icon = iconNamed(bar.leadingIcon) {
            return .button(icon: icon, action: {})
        }
        switch bar.leading {
        case "none":
            return .none
        case "back", "button":
            if selectedTab > 0 {
                return .back(action: { selectedTab = 0 })
            }
            return .back()
        default:
            return .none
        }
    }

    private func trailing(for bar: ScreenNavigationBarMetadata) -> SCNNavigationBarTrailing {
        if let icon = iconNamed(bar.trailingIcon) {
            return .button(icon: icon, action: {})
        }
        switch bar.trailing {
        case "close", "button":
            return .close()
        default:
            return .none
        }
    }

    private func iconNamed(_ name: String) -> SCNIconName? {
        guard name.isEmpty == false else { return nil }
        return SCNIconName(rawValue: name)
    }

    private func centerIcon(for bar: ScreenNavigationBarMetadata) -> Image? {
        guard bar.centerIcon.isEmpty == false else {
            return nil
        }
        return Image(bar.centerIcon).renderingMode(.template)
    }

    private func barBackground(for bar: ScreenNavigationBarMetadata) -> Color {
        switch bar.background {
        case "card":
            return theme.palette.card
        case "primary":
            return theme.palette.primary
        case "muted":
            return theme.palette.muted
        case "secondary":
            return theme.palette.secondary
        default:
            return theme.palette.background
        }
    }
}

private struct FastRefreshModifier: ViewModifier {
    let enabled: Bool
    let action: () async -> Void

    @ViewBuilder
    func body(content: Content) -> some View {
        if enabled {
            content.refreshable(action: action)
        } else {
            content
        }
    }
}
