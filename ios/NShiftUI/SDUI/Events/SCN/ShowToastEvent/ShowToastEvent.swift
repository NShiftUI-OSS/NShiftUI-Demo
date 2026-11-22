import NShiftUI
import SwiftUI
import UIKit

@NShiftMetadata
struct ShowToastEventMetadata: NShiftMetadata, Decodable {
    let title: String
    let message: String
    let icon: String
    /// Seconds on screen.
    let duration: Double

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        message = try container.decodeIfPresent(String.self, forKey: .message) ?? ""
        icon = try container.decodeIfPresent(String.self, forKey: .icon) ?? ""
        if let seconds = try? container.decodeIfPresent(Double.self, forKey: .duration) {
            duration = seconds
        } else {
            duration = Double(try container.decodeIfPresent(Int.self, forKey: .duration) ?? 0)
        }
    }

    private enum CodingKeys: String, CodingKey {
        case title, message, icon, duration
    }
}

/// `ShowToastEvent(title:, message:, icon:, duration:)`: shows the design
/// system toast at the top of the screen, over every screen, without blocking
/// the next events. A new toast replaces the one on screen.
@NShiftEvent(
    name: "ShowToastEvent",
    version: "1.0.0",
    metadata: ShowToastEventMetadata.self
)
struct ShowToastEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let toast = ToastContent(
            title: metadata.title,
            message: metadata.message,
            icon: SCNIconName(rawValue: metadata.icon)
        )
        let duration = metadata.duration > 0 ? metadata.duration : 2.5
        await ToastPresenter.shared.show(toast, duration: duration)
        await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
    }
}

struct ToastContent: Equatable {
    let id = UUID()
    let title: String
    let message: String
    let icon: SCNIconName?
}

@MainActor
final class ToastPresenter: ObservableObject {
    static let shared = ToastPresenter()

    @Published private(set) var current: ToastContent?
    private var window: UIWindow?
    private var hideTask: Task<Void, Never>?

    func show(_ toast: ToastContent, duration: Double) {
        guard attachWindow() else { return }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            current = toast
        }
        hideTask?.cancel()
        hideTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))
            guard Task.isCancelled == false else { return }
            self?.hide()
        }
    }

    private func hide() {
        withAnimation(.easeIn(duration: 0.25)) {
            current = nil
        }
        hideTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 300_000_000)
            guard Task.isCancelled == false, self?.current == nil else { return }
            self?.window?.isHidden = true
            self?.window = nil
        }
    }

    private func attachWindow() -> Bool {
        if window != nil { return true }
        guard let scene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }) else {
            return false
        }
        // Touches pass through to the app: the toast is information only.
        let overlay = PassthroughWindow(windowScene: scene)
        overlay.windowLevel = .statusBar + 1
        overlay.backgroundColor = .clear
        let host = UIHostingController(
            rootView: ToastOverlayView(presenter: self)
                .environmentObject(SCNTheme.shared)
        )
        host.view.backgroundColor = .clear
        overlay.rootViewController = host
        overlay.isHidden = false
        window = overlay
        return true
    }
}

private final class PassthroughWindow: UIWindow {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        nil
    }
}

private struct ToastOverlayView: View {
    @EnvironmentObject private var theme: SCNTheme
    @ObservedObject var presenter: ToastPresenter

    var body: some View {
        VStack {
            if let toast = presenter.current {
                SCNToast(
                    title: toast.title,
                    message: toast.message,
                    icon: toast.icon
                )
                .shadow(color: .black.opacity(0.25), radius: 16, x: 0, y: 8)
                .padding(.horizontal, theme.spacing.s4)
                .id(toast.id)
                .transition(.move(edge: .top).combined(with: .opacity))
            }
            Spacer()
        }
        .padding(.top, theme.spacing.s2)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }
}
