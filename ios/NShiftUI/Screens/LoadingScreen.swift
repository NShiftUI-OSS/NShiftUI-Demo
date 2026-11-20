import SwiftUI

struct LoadingScreen: View {
    var body: some View {
        SCNSpinner()
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity
            )
            .navigationBarBackButtonHidden(true)
            .scnNavigationBar(
                title: "",
                leading: .back()
            )
    }
}
