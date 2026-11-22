import NShiftUI
import SwiftUI
import UIKit

@NShiftMetadata
struct ShowSuccessEventMetadata: NShiftMetadata, Decodable {
    let title: String
    let message: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        message = try container.decodeIfPresent(String.self, forKey: .message) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case title, message
    }
}

/// `ShowSuccessEvent(title:, message:)`: shows an animated success check over
/// everything (sheets and modals included) and finishes when it is gone, so
/// the next events of the same trigger run after the animation.
@NShiftEvent(
    name: "ShowSuccessEvent",
    version: "1.0.0",
    metadata: ShowSuccessEventMetadata.self
)
struct ShowSuccessEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        await SuccessOverlay.show(title: metadata.title, message: metadata.message)
        await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
    }
}

@MainActor
private enum SuccessOverlay {
    private static var window: UIWindow?

    static func show(title: String, message: String) async {
        guard window == nil,
              let scene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }) else {
            return
        }
        let overlay = UIWindow(windowScene: scene)
        overlay.windowLevel = .alert + 1
        overlay.backgroundColor = .clear
        let host = UIHostingController(
            rootView: SuccessOverlayView(title: title, message: message)
                .environmentObject(SCNTheme.shared)
        )
        host.view.backgroundColor = .clear
        overlay.rootViewController = host
        overlay.isHidden = false
        window = overlay
        UINotificationFeedbackGenerator().notificationOccurred(.success)

        try? await Task.sleep(nanoseconds: 1_900_000_000)
        UIView.animate(withDuration: 0.25) {
            overlay.alpha = 0
        } completion: { _ in
            overlay.isHidden = true
        }
        try? await Task.sleep(nanoseconds: 260_000_000)
        window = nil
    }
}

private struct SuccessOverlayView: View {
    @EnvironmentObject private var theme: SCNTheme
    let title: String
    let message: String
    @State private var appeared = false
    @State private var drawn: CGFloat = 0

    var body: some View {
        ZStack {
            Color.black.opacity(appeared ? 0.45 : 0)
                .ignoresSafeArea()
            VStack(spacing: theme.spacing.s4) {
                ZStack {
                    Circle()
                        .fill(theme.palette.primary)
                        .frame(width: 88, height: 88)
                        .scaleEffect(appeared ? 1 : 0.4)
                    SuccessCheck()
                        .trim(from: 0, to: drawn)
                        .stroke(
                            theme.palette.primaryForeground,
                            style: StrokeStyle(lineWidth: 7, lineCap: .round, lineJoin: .round)
                        )
                        .frame(width: 40, height: 30)
                }
                if title.isEmpty == false {
                    SCNText(title, style: .lg, weight: .semibold)
                }
                if message.isEmpty == false {
                    SCNText(message, color: .mutedForeground)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(theme.spacing.s6)
            .frame(maxWidth: 300)
            .background(
                theme.palette.card,
                in: RoundedRectangle(cornerRadius: theme.radius.xl, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: theme.radius.xl, style: .continuous)
                    .strokeBorder(theme.palette.border, lineWidth: 1)
            )
            .scaleEffect(appeared ? 1 : 0.85)
            .opacity(appeared ? 1 : 0)
        }
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.65)) {
                appeared = true
            }
            withAnimation(.easeOut(duration: 0.45).delay(0.25)) {
                drawn = 1
            }
        }
    }
}

private struct SuccessCheck: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.width * 0.38, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        return path
    }
}
