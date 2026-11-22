import SwiftUI

struct NShiftLaunchScreen: View {
    @EnvironmentObject private var theme: SCNTheme

    var body: some View {
        VStack(spacing: theme.spacing.s4) {
            SCNText(
                "NShiftUI",
                style: .xl,
                weight: .semibold
            )
            SCNSpinner()
        }
        .frame(
            maxWidth: .infinity,
            maxHeight: .infinity
        )
        .background(theme.palette.background)
        .ignoresSafeArea()
        .navigationBarHidden(true)
    }
}
