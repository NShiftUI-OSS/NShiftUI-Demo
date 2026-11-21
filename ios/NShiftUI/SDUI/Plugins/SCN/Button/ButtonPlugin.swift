import NShiftUI
import SwiftUI

@NShiftMetadata
struct ButtonMetadata: NShiftMetadata, Decodable {
    let title: String
    let icon: String?
    let variant: String
    let size: String
    let isEnabled: Bool

    func scnVariant() -> SCNButton.Variant {
        switch variant {
        case "outline": return .outline
        case "secondary": return .secondary
        case "ghost": return .ghost
        case "destructive": return .destructive
        case "link": return .link
        default: return .default
        }
    }

    func scnSize() -> SCNButton.Size {
        switch size {
        case "xs": return .xs
        case "sm": return .sm
        case "lg": return .lg
        case "iconXs": return .iconXs
        case "iconSm": return .iconSm
        case "icon": return .icon
        case "iconLg": return .iconLg
        default: return .default
        }
    }
}

@NShiftPlugin(
    name: "Button",
    version: "1.0.0",
    metadata: ButtonMetadata.self
)
struct ButtonPlugin: NShiftPlugin {
    var body: some View {
        let control = labeledButton
        if style.frame.hasFixedWidth || style.frame.hasFixedHeight {
            control.frame(
                maxWidth: style.frame.hasFixedWidth ? .infinity : nil,
                maxHeight: style.frame.hasFixedHeight ? .infinity : nil
            )
        } else {
            control
        }
    }

    @ViewBuilder
    private var labeledButton: some View {
        if let icon = metadata.icon.flatMap(SCNIconName.init(rawValue:)) {
            SCNButton(
                icon: icon,
                variant: metadata.scnVariant(),
                size: metadata.scnSize(),
                isEnabled: metadata.isEnabled
            ) {
                fire(
                    .onTap,
                    engine: engine,
                    renderID: renderID
                )
            }
        } else {
            SCNButton(
                title: metadata.title,
                variant: metadata.scnVariant(),
                size: metadata.scnSize(),
                isEnabled: metadata.isEnabled
            ) {
                fire(
                    .onTap,
                    engine: engine,
                    renderID: renderID
                )
            }
        }
    }
}
