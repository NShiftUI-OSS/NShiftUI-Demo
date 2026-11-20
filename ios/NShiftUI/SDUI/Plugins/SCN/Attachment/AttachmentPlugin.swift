import NShiftUI
import SwiftUI

@NShiftMetadata
struct AttachmentMetadata: NShiftMetadata, Decodable {
    let title: String
    let detail: String?
    let state: String
    let size: String
    let orientation: String

    func scnState() -> SCNAttachment.State {
        switch state {
        case "idle": return .idle
        case "uploading": return .uploading
        case "processing": return .processing
        case "error": return .error
        default: return .done
        }
    }

    func scnSize() -> SCNAttachment.Size {
        switch size {
        case "xs": return .xs
        case "sm": return .sm
        default: return .default
        }
    }

    func scnOrientation() -> SCNAttachment.Orientation {
        orientation == "vertical" ? .vertical : .horizontal
    }
}

@NShiftPlugin(
    name: "Attachment",
    version: "1.0.0",
    metadata: AttachmentMetadata.self
)
struct AttachmentPlugin: NShiftPlugin {
    var body: some View {
        SCNAttachment(
            title: metadata.title,
            detail: metadata.detail,
            state: metadata.scnState(),
            size: metadata.scnSize(),
            orientation: metadata.scnOrientation()
        )
    }
}
