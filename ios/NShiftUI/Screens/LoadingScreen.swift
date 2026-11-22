import SwiftUI

struct LoadingScreen: View {
    @Environment(\.tabBarHosted) private var tabBarHosted

    var body: some View {
        SCNSpinner()
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .modifier(
                StandaloneNavigationBar(
                    hosted: tabBarHosted,
                    title: "",
                    leading: .back()
                )
            )
    }
}

struct StandaloneNavigationBar: ViewModifier {
    @Environment(\.modalDismiss) private var modalDismiss
    @Environment(\.isStackRoot) private var isStackRoot
    let hosted: Bool
    let title: String
    var leading: SCNNavigationBarLeading = .none

    @ViewBuilder
    func body(content: Content) -> some View {
        if hosted {
            content
        } else if let modalDismiss {
            // A modal screen closes from the right; it has no back button.
            content
                .navigationBarBackButtonHidden(true)
                .scnNavigationBar(
                    title: title,
                    trailing: .close(action: modalDismiss)
                )
        } else {
            content
                .navigationBarBackButtonHidden(true)
                .scnNavigationBar(
                    title: title,
                    // The first screen of the stack has nowhere to go back to.
                    leading: isStackRoot ? .none : leading
                )
        }
    }
}

private struct IsStackRootKey: EnvironmentKey {
    static let defaultValue = false
}

private struct ModalDismissKey: EnvironmentKey {
    static let defaultValue: (() -> Void)? = nil
}

extension EnvironmentValues {
    /// True for the first screen of the navigation stack.
    var isStackRoot: Bool {
        get { self[IsStackRootKey.self] }
        set { self[IsStackRootKey.self] = newValue }
    }

    /// Set on screens presented with `presentation: "modal"`: closes the modal.
    var modalDismiss: (() -> Void)? {
        get { self[ModalDismissKey.self] }
        set { self[ModalDismissKey.self] = newValue }
    }
}
