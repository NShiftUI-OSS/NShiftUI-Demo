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
    let hosted: Bool
    let title: String
    var leading: SCNNavigationBarLeading = .none

    @ViewBuilder
    func body(content: Content) -> some View {
        if hosted {
            content
        } else {
            content
                .navigationBarBackButtonHidden(true)
                .scnNavigationBar(
                    title: title,
                    leading: leading
                )
        }
    }
}
