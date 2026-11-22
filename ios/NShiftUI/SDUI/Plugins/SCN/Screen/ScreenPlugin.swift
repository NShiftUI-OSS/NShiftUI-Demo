import NShiftUI
import SwiftUI
import UIKit

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
    let isLazy: Bool
    let fastRefresh: Bool
    let header: [NShiftPluginModel]
    let footer: [NShiftPluginModel]

    init(
        enabled: Bool = false,
        isLazy: Bool = false,
        fastRefresh: Bool = false,
        header: [NShiftPluginModel] = [],
        footer: [NShiftPluginModel] = []
    ) {
        self.enabled = enabled
        self.isLazy = isLazy
        self.fastRefresh = fastRefresh
        self.header = header
        self.footer = footer
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        enabled = try container.decodeIfPresent(Bool.self, forKey: .enabled) ?? false
        isLazy = try container.decodeIfPresent(Bool.self, forKey: .isLazy) ?? false
        fastRefresh = try container.decodeIfPresent(Bool.self, forKey: .fastRefresh) ?? false
        header = []
        footer = []
    }

    private enum CodingKeys: String, CodingKey {
        case enabled
        case isLazy
        case fastRefresh
    }
}

@NShiftMetadata
struct ScreenMetadata: NShiftMetadata, Decodable, NShiftRainbowPluginMetadata {
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

    func decodeRainbowMetadata(
        with context: NShiftRainbowMetadataDecodingContext
    ) throws -> NShiftRainbowMetadataDecodeResult {
        var slots: [NShiftSlotName: [NShiftPluginModel]] = [:]
        let header = try context.compilePlugins("scroll.header")
        let footer = try context.compilePlugins("scroll.footer")
        if header.isEmpty == false {
            slots[ScreenSlot.scrollHeader.slotName] = header
        }
        if footer.isEmpty == false {
            slots[ScreenSlot.scrollFooter.slotName] = footer
        }
        let enrichedScroll = scroll.map {
            ScreenScrollMetadata(
                enabled: $0.enabled,
                isLazy: $0.isLazy,
                fastRefresh: $0.fastRefresh,
                header: header,
                footer: footer
            )
        }
        return NShiftRainbowMetadataDecodeResult(
            metadata: AnyNShiftMetadata(
                ScreenMetadata(
                    navigationBar: navigationBar,
                    scroll: enrichedScroll
                )
            ),
            slots: slots
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
    case scrollHeader
    case scrollFooter
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
        let isLazy = metadata.scroll?.isLazy == true
        if isLazy {
            List {
                scrollRows
            }
            .listStyle(.plain)
            .hiddenScrollContentBackground()
            .background(ListContentInsetNormalizer())
            .background(theme.palette.background)
            .modifier(
                FastRefreshModifier(enabled: fastRefresh) {
                    await viewModel.refresh()
                }
            )
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
        } else if metadata.scroll?.enabled == true || fastRefresh {
            GeometryReader { geometry in
                ScrollView(.vertical) {
                    VStack(alignment: .leading, spacing: 0) {
                        scrollPageChildren
                    }
                    .padding(.top, 16)
                    .padding(.horizontal, 16)
                        .frame(
                            maxWidth: .infinity,
                            minHeight: geometry.size.height,
                            alignment: .top
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
            VStack(alignment: .leading, spacing: 0) {
                pageChildren
            }
            .padding(.top, 16)
            .padding(.horizontal, 16)
                .frame(
                    maxWidth: .infinity,
                    maxHeight: .infinity,
                    alignment: .top
                )
        }
    }

    @ViewBuilder
    private var scrollRows: some View {
        slots(.scrollHeader) { _, view in
            listRow(view)
        }
        children { model, view in
            if model.name.rawValue != "TabBar" {
                listRow(view)
            }
        }
        slots(.scrollFooter) { _, view in
            listRow(view)
        }
    }

    @ViewBuilder
    private var scrollPageChildren: some View {
        slots(.scrollHeader)
        pageChildren
        slots(.scrollFooter)
    }

    @ViewBuilder
    private func listRow(_ view: NShiftNodeView) -> some View {
        view
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .padding(.horizontal, 16)
            .listRowInsets(EdgeInsets())
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
    }

    @ViewBuilder
    private var pageChildren: some View {
        children { model, view in
            if model.name.rawValue != "TabBar" {
                view
            }
        }
    }

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
    let action: @Sendable () async -> Void

    @ViewBuilder
    func body(content: Content) -> some View {
        if enabled {
            content.refreshable(action: action)
        } else {
            content
        }
    }
}

private extension View {
    @ViewBuilder
    func hiddenScrollContentBackground() -> some View {
        if #available(iOS 16.0, *) {
            scrollContentBackground(.hidden)
        } else {
            background(LegacyListBackgroundClearer())
        }
    }
}

private struct LegacyListBackgroundClearer: UIViewRepresentable {
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.isUserInteractionEnabled = false
        view.backgroundColor = .clear
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        DispatchQueue.main.async {
            clearNearestTable(from: uiView)
        }
    }

    private func clearNearestTable(from view: UIView) {
        var current: UIView? = view
        while let node = current {
            if let table = node as? UITableView {
                clear(table)
                return
            }
            if let table = table(in: node.subviews) {
                clear(table)
                return
            }
            current = node.superview
        }
    }

    private func table(in views: [UIView]) -> UITableView? {
        for view in views {
            if let table = view as? UITableView {
                return table
            }
            if let table = table(in: view.subviews) {
                return table
            }
        }
        return nil
    }

    private func clear(_ table: UITableView) {
        table.backgroundColor = .clear
        table.backgroundView = UIView()
        table.backgroundView?.backgroundColor = .clear
    }
}

private struct ListContentInsetNormalizer: UIViewRepresentable {
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.isUserInteractionEnabled = false
        view.backgroundColor = .clear
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        DispatchQueue.main.async {
            normalizeScrollView(from: uiView)
        }
    }

    private func normalizeScrollView(from view: UIView) {
        var current: UIView? = view
        while let node = current {
            if let scrollView = node as? UIScrollView {
                normalize(scrollView)
                return
            }
            if let scrollView = scrollView(in: node.subviews) {
                normalize(scrollView)
                return
            }
            current = node.superview
        }
    }

    private func scrollView(in views: [UIView]) -> UIScrollView? {
        for view in views {
            if let scrollView = view as? UIScrollView {
                return scrollView
            }
            if let scrollView = scrollView(in: view.subviews) {
                return scrollView
            }
        }
        return nil
    }

    private func normalize(_ scrollView: UIScrollView) {
        scrollView.contentInset.top = 16
        scrollView.contentInset.left = 0
        scrollView.contentInset.right = 0
        scrollView.contentInset.bottom = 0
        scrollView.layoutMargins = .zero
    }
}
