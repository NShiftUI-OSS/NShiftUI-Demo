import NShiftUI
import SwiftUI
import WebKit

@NShiftMetadata
struct WebViewMetadata: NShiftMetadata, Decodable {
    let navigationBar: ScreenNavigationBarMetadata?
    /// Page to show; accepts `{{route.x}}` placeholders.
    let url: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        navigationBar = try container.decodeIfPresent(ScreenNavigationBarMetadata.self, forKey: .navigationBar)
        url = try container.decodeIfPresent(String.self, forKey: .url) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case navigationBar, url
    }
}

/// `WebView(navigationBar:, url:)`: a root container like `Screen` whose
/// content is a web page. It keeps the design-system navigation bar, so it is
/// pushed, presented as a modal or closed like any other screen.
@NShiftPlugin(
    name: "WebView",
    version: "1.0.0",
    metadata: WebViewMetadata.self
)
struct WebViewPlugin: NShiftPluginContainer {
    @StateObject var viewModel: ScreenViewModel
    @EnvironmentObject private var theme: SCNTheme
    @Environment(\.screenRouteParameters) private var routeParameters
    @Environment(\.tabBarHosted) private var tabBarHosted
    @Environment(\.modalDismiss) private var modalDismiss
    @Environment(\.isStackRoot) private var isStackRoot
    @StateObject private var page = WebPageState()

    var body: some View {
        content
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background { theme.palette.background.ignoresSafeArea() }
            .modifier(WebViewBar(hosted: tabBarHosted, bar: bar, leading: leading, trailing: trailing))
            .onAppear {
                viewModel.bindRouteParameters(routeParameters)
                ScreenViewModel.activate(viewModel, for: engine)
            }
    }

    @ViewBuilder
    private var content: some View {
        if let url = resolvedURL {
            ZStack {
                WebPage(url: url, state: page)
                    .opacity(page.phase == .loaded ? 1 : 0)
                switch page.phase {
                case .loading:
                    SCNSpinner()
                case .failed:
                    VStack(spacing: theme.spacing.s2) {
                        SCNText("Não foi possível abrir a página", style: .lg, weight: .medium)
                        SCNText("Verifique a conexão e tente de novo.", color: .mutedForeground)
                            .multilineTextAlignment(.center)
                        SCNButton(title: "Tentar de novo", variant: .outline) {
                            page.reload()
                        }
                    }
                    .padding(theme.spacing.s6)
                case .loaded:
                    EmptyView()
                }
            }
        } else {
            SCNText("Endereço inválido", color: .mutedForeground)
        }
    }

    private var bar: ScreenNavigationBarMetadata {
        metadata.navigationBar ?? .init()
    }

    private var resolvedURL: URL? {
        let context: [String: Any] = ["route": routeParameters]
        let raw = RainbowTemplate.renderURL(metadata.url, context: context)
        guard let url = URL(string: raw), url.scheme == "https" || url.scheme == "http" else {
            return nil
        }
        return url
    }

    private var leading: SCNNavigationBarLeading {
        switch bar.leading {
        case "none":
            return .none
        case "back", "button":
            return .back()
        default:
            // Same rule as `Screen`: back only where there is somewhere to go.
            return isStackRoot == false && modalDismiss == nil ? .back() : .none
        }
    }

    private var trailing: SCNNavigationBarTrailing {
        if let modalDismiss {
            return .close(action: modalDismiss)
        }
        return bar.trailing == "close" ? .close() : .none
    }
}

private struct WebViewBar: ViewModifier {
    let hosted: Bool
    let bar: ScreenNavigationBarMetadata
    let leading: SCNNavigationBarLeading
    let trailing: SCNNavigationBarTrailing

    @ViewBuilder
    func body(content: Content) -> some View {
        if hosted {
            content
        } else {
            content.scnNavigationBar(
                title: bar.title,
                leading: leading,
                trailing: trailing,
                isTranslucent: true
            )
        }
    }
}

@MainActor
private final class WebPageState: NSObject, ObservableObject, WKNavigationDelegate {
    enum Phase { case loading, loaded, failed }

    @Published var phase: Phase = .loading
    weak var webView: WKWebView?

    func reload() {
        phase = .loading
        webView?.reload()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        phase = .loaded
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fail(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fail(error)
    }

    private func fail(_ error: Error) {
        // A navigation replaced by another one is not a failure.
        guard (error as NSError).code != NSURLErrorCancelled else { return }
        phase = .failed
    }
}

private struct WebPage: UIViewRepresentable {
    let url: URL
    let state: WebPageState

    func makeUIView(context: Context) -> WKWebView {
        let view = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
        view.navigationDelegate = state
        view.isOpaque = false
        view.backgroundColor = .clear
        view.allowsBackForwardNavigationGestures = true
        state.webView = view
        view.load(URLRequest(url: url))
        return view
    }

    func updateUIView(_ view: WKWebView, context: Context) {
        guard view.url == nil, view.isLoading == false else { return }
        view.load(URLRequest(url: url))
    }
}
