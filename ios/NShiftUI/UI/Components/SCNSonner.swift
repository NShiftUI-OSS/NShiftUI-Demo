import SwiftUI

struct SCNSonner: View {
    private let title: String
    private let message: String?

    init(
        title: String,
        message: String? = nil
    ) {
        self.title = title
        self.message = message
    }

    var body: some View {
        SCNToast(
            title: title,
            message: message
        )
    }
}

#Preview {
    SCNComponentPreview {
        SCNSonner(
            title: "Sent",
            message: "The note is on its way."
        )
    }
}
