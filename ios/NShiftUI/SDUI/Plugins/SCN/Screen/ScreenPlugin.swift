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

    var body: some View {
        styled(content)
            .onAppear {
                viewModel.bind(refresh: screenRefresh)
            }
    }

    private func styled<Content: View>(_ content: Content) -> some View {
        content
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .background(slots(.bottomSheet))
            .scnNavigationBar(
                title: navigationBar.title,
                leading: leading,
                center: centerIcon,
                trailing: trailing,
                background: barBackground
            )
            .scnScreenTheme(
                name: navigationBar.theme,
                interfaceStyle: theme.interfaceStyle
            )
    }

    @ViewBuilder
    private var content: some View {
        let fastRefresh = metadata.scroll?.fastRefresh == true
        if metadata.scroll?.enabled == true || fastRefresh {
            GeometryReader { geometry in
                ScrollView(.vertical) {
                    children()
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
            children()
                .frame(
                    maxWidth: .infinity,
                    maxHeight: .infinity,
                    alignment: .center
                )
        }
    }

    private var navigationBar: ScreenNavigationBarMetadata {
        metadata.navigationBar ?? .init()
    }

    private var leading: SCNNavigationBarLeading {
        if let icon = iconNamed(navigationBar.leadingIcon) {
            return .button(icon: icon, action: {})
        }
        return .none
    }

    private var trailing: SCNNavigationBarTrailing {
        if let icon = iconNamed(navigationBar.trailingIcon) {
            return .button(icon: icon, action: {})
        }
        switch navigationBar.trailing {
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

    private var centerIcon: Image? {
        guard navigationBar.centerIcon.isEmpty == false else {
            return nil
        }
        return Image(navigationBar.centerIcon).renderingMode(.template)
    }

    private var barBackground: Color? {
        switch navigationBar.background {
        case "background":
            return theme.palette.background
        case "card":
            return theme.palette.card
        case "primary":
            return theme.palette.primary
        case "muted":
            return theme.palette.muted
        case "secondary":
            return theme.palette.secondary
        default:
            return nil
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
