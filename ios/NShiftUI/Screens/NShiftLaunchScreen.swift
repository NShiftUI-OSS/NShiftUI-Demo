import SwiftUI

struct NShiftLaunchScreen: View {
    @EnvironmentObject private var theme: SCNTheme

    var body: some View {
        ZStack {
            theme.palette.background
                .ignoresSafeArea()
            VStack(spacing: theme.spacing.s4) {
                SCNText(
                    "NShiftUI",
                    style: .xl,
                    weight: .semibold
                )
                SCNSpinner()
            }
        }
    }
}
