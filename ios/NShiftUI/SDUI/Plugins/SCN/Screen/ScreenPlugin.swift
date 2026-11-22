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

private struct ScreenRouteParametersKey: EnvironmentKey {
    static let defaultValue: [String: String] = [:]
}

extension EnvironmentValues {
    var screenRouteParameters: [String: String] {
        get { self[ScreenRouteParametersKey.self] }
        set { self[ScreenRouteParametersKey.self] = newValue }
    }
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
    @Environment(\.screenRouteParameters) private var routeParameters
    @Environment(\.screenRefresh) private var screenRefresh
    @Environment(\.tabBarHosted) private var tabBarHosted
    @Environment(\.tabChromeReport) private var tabChromeReport
    @StateObject private var scrollEnd = ScrollEndState()
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
        .background(
            EngineViewModelBinder(engine: engine, viewModel: viewModel)
        )
        .onAppear {
            viewModel.bindRouteParameters(routeParameters)
            viewModel.bind(refresh: screenRefresh)
            tabChromeReport?.report(navigationBar)
        }
        .onChange(of: routeParameters) { parameters in
            viewModel.bindRouteParameters(parameters)
        }
        .task(id: routeParameters) {
            await viewModel.loadRouteParameters(engine: engine)
        }
        .onChange(of: navigationBar) { bar in
            tabChromeReport?.report(bar)
        }
    }

    @ViewBuilder
    private var bottomSheets: some View {
        if let tree = engine as? any NShiftEngineTree,
           let node = tree.node(withRenderID: renderID) {
            ObservedSlotChildren(
                node: node,
                name: ScreenSlot.bottomSheet.slotName,
                engine: tree,
                viewModel: viewModel
            )
        } else {
            slots(.bottomSheet)
        }
    }

    private var hostedBody: some View {
        content
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .background(bottomSheets)
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
            .background(bottomSheets)
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
                ScrollEndSentinel(state: scrollEnd)
            }
            .listStyle(.plain)
            .environment(\.defaultMinListRowHeight, 0)
            .hiddenScrollContentBackground()
            .hiddenScrollIndicators()
            .background(ListContentInsetNormalizer())
            .background(
                ScrollEndDetector(target: .list, state: scrollEnd) {
                    fire(
                        .onScrollEndReached,
                        engine: engine,
                        renderID: renderID
                    )
                }
            )
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
                .background(
                    ScrollEndDetector(target: .scrollView, state: scrollEnd) {
                        fire(
                            .onScrollEndReached,
                            engine: engine,
                            renderID: renderID
                        )
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
            listRow(view, edge: .bottom)
        }
        if let tree = engine as? any NShiftEngineTree,
           let stack = lazyRootStack(in: tree) {
            LazyStackRows(node: stack, screen: viewModel, engine: tree, viewModel: viewModel) { view, spacing, alignment in
                view
                    .frame(maxWidth: .infinity, alignment: alignment)
                    .padding(.top, spacing)
                    .padding(.horizontal, 16)
                    .listRowInsets(EdgeInsets())
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
            }
        } else {
            children { model, view in
                if model.name.rawValue != "TabBar" {
                    listRow(view)
                }
            }
        }
        slots(.scrollFooter) { _, view in
            listRow(view, edge: .top)
        }
    }

    private func lazyRootStack(in tree: any NShiftEngineTree) -> NShiftPluginNode? {
        guard let screen = tree.node(withRenderID: renderID) else { return nil }
        let content = screen.children.filter { $0.model.name.rawValue != "TabBar" }
        guard content.count == 1,
              let stack = content.first,
              stack.model.name.rawValue == "VerticalStack",
              stack.model.metadata?.unwrap(as: StackLayoutMetadata.self) != nil else {
            return nil
        }
        return stack
    }

    @ViewBuilder
    private var scrollPageChildren: some View {
        slots(.scrollHeader)
        pageChildren
        slots(.scrollFooter)
    }

    @ViewBuilder
    private func listRow(
        _ view: NShiftNodeView,
        edge: Edge.Set = []
    ) -> some View {
        view
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .padding(edge, 12)
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
    func hiddenScrollIndicators() -> some View {
        if #available(iOS 16.0, *) {
            scrollIndicators(.hidden)
        } else {
            self
        }
    }

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
        scrollView.contentInset.bottom = 16
        scrollView.layoutMargins = .zero
        scrollView.showsVerticalScrollIndicator = false
        scrollView.showsHorizontalScrollIndicator = false
    }
}

private struct LazyStackRows<Row: View>: View {
    @ObservedObject var node: NShiftPluginNode
    @ObservedObject var screen: ScreenViewModel
    let engine: any NShiftEngineTree
    let viewModel: (any NShiftPluginViewModel)?
    let row: (NShiftNodeView, CGFloat, Alignment) -> Row

    var body: some View {
        let layout = node.model.metadata?.unwrap(as: StackLayoutMetadata.self)
        let spacing = CGFloat(layout?.spacing ?? 0)
        let alignment: Alignment = switch layout?.horizontalAlignment() {
        case .center?: .top
        case .trailing?: .topTrailing
        default: .topLeading
        }
        let visible = node.children.filter {
            CardMetadata.isHidden($0.model, in: screen.inputs) == false
        }
        let firstID = visible.first?.renderId
        ForEach(visible, id: \.renderId) { child in
            row(
                NShiftNodeView(node: child, engine: engine, viewModel: viewModel),
                child.renderId == firstID ? 0 : spacing,
                alignment
            )
        }
    }
}

private struct ObservedSlotChildren: View {
    @ObservedObject var node: NShiftPluginNode
    let name: NShiftSlotName
    let engine: any NShiftEngineTree
    let viewModel: (any NShiftPluginViewModel)?

    var body: some View {
        ForEach(node.slotChildren[name] ?? [], id: \.renderId) { child in
            NShiftNodeView(node: child, engine: engine, viewModel: viewModel)
        }
    }
}

private struct EngineViewModelBinder: UIViewRepresentable {
    let engine: (any NShiftEngine)?
    let viewModel: ScreenViewModel

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.isUserInteractionEnabled = false
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        ScreenViewModel.activate(viewModel, for: engine)
    }
}

@MainActor
private final class ScrollEndState: ObservableObject {
    var onReached: () -> Void = {}
    private var isArmed = false
    private var isEndVisible = false

    func userBeganScrolling() {
        isArmed = true
        evaluate()
    }

    func setEndVisible(_ visible: Bool) {
        isEndVisible = visible
        evaluate()
    }

    private func evaluate() {
        guard isArmed, isEndVisible else { return }
        isArmed = false
        onReached()
    }
}

private struct ScrollEndSentinel: View {
    let state: ScrollEndState

    var body: some View {
        Color.clear
            .frame(height: 1)
            .listRowInsets(EdgeInsets())
            .listRowSeparator(.hidden)
            .listRowBackground(Color.clear)
            .onAppear { state.setEndVisible(true) }
            .onDisappear { state.setEndVisible(false) }
    }
}

@MainActor
private struct ScrollEndDetector: UIViewRepresentable {
    enum Target {
        case list
        case scrollView
    }

    let target: Target
    let state: ScrollEndState
    let onReached: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(target: target, state: state)
    }

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.isUserInteractionEnabled = false
        view.backgroundColor = .clear
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        state.onReached = onReached
        DispatchQueue.main.async {
            context.coordinator.attach(to: uiView)
        }
    }

    static func dismantleUIView(_ uiView: UIView, coordinator: Coordinator) {
        coordinator.detach()
    }

    @MainActor
    final class Coordinator: NSObject {
        private let target: Target
        private let state: ScrollEndState
        private weak var scrollView: UIScrollView?
        private var observations: [NSKeyValueObservation] = []
        private var attachAttempts = 0

        init(target: Target, state: ScrollEndState) {
            self.target = target
            self.state = state
        }

        func attach(to view: UIView) {
            guard let found = locateScrollView(from: view) else {
                guard attachAttempts < 20 else { return }
                attachAttempts += 1
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self, weak view] in
                    guard let view else { return }
                    self?.attach(to: view)
                }
                return
            }
            attachAttempts = 0
            guard found !== scrollView else { return }
            detach()
            scrollView = found
            found.showsVerticalScrollIndicator = false
            found.showsHorizontalScrollIndicator = false
            found.panGestureRecognizer.addTarget(self, action: #selector(userDidPan(_:)))
            guard target == .scrollView else { return }
            observations = [
                found.observe(\.contentOffset, options: [.new]) { [weak self] _, _ in
                    MainActor.assumeIsolated { self?.updateEndVisibility() }
                },
                found.observe(\.contentSize, options: [.new]) { [weak self] _, _ in
                    MainActor.assumeIsolated { self?.updateEndVisibility() }
                },
            ]
        }

        func detach() {
            observations.forEach { $0.invalidate() }
            observations = []
            scrollView?.panGestureRecognizer.removeTarget(self, action: #selector(userDidPan(_:)))
            scrollView = nil
        }

        @objc private func userDidPan(_ recognizer: UIPanGestureRecognizer) {
            guard recognizer.state == .began else { return }
            state.userBeganScrolling()
        }

        private func updateEndVisibility() {
            guard let scrollView else { return }
            let insets = scrollView.adjustedContentInset
            let viewport = scrollView.bounds.height - insets.top - insets.bottom
            guard scrollView.contentSize.height > viewport else {
                state.setEndVisible(false)
                return
            }
            let visibleBottom = scrollView.contentOffset.y
                + scrollView.bounds.height
                - insets.bottom
            state.setEndVisible(visibleBottom >= scrollView.contentSize.height - 24)
        }

        private func locateScrollView(from view: UIView) -> UIScrollView? {
            var current: UIView? = view
            while let node = current {
                if let match = node as? UIScrollView, accepts(match) {
                    return match
                }
                if let match = search(node.subviews) {
                    return match
                }
                current = node.superview
            }
            return nil
        }

        private func search(_ views: [UIView]) -> UIScrollView? {
            for view in views {
                if let match = view as? UIScrollView, accepts(match) {
                    return match
                }
                if let match = search(view.subviews) {
                    return match
                }
            }
            return nil
        }

        private func accepts(_ scrollView: UIScrollView) -> Bool {
            switch target {
            case .list:
                return scrollView is UITableView || scrollView is UICollectionView
            case .scrollView:
                return (scrollView is UITableView || scrollView is UICollectionView) == false
                    && scrollView.alwaysBounceHorizontal == false
            }
        }
    }
}
