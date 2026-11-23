import NShiftUI
import SwiftUI

@NShiftMetadata
struct SwipeActionMetadata: NShiftMetadata, Decodable {
    let title: String
    let icon: String?
    let variant: String?
}

@NShiftSlotKey
enum SwipeActionsSlot: NShiftSlotKey {
    case leading
    case trailing
}

@NShiftPlugin(name: "SwipeAction", version: "1.0.0", metadata: SwipeActionMetadata.self)
struct SwipeActionPlugin: NShiftPlugin {
    var body: some View { EmptyView() }
}

@NShiftPlugin(name: "SwipeActions", version: "1.0.0", slots: SwipeActionsSlot.self)
struct SwipeActionsPlugin: NShiftPlugin {
    var body: some View { children() }
}

/// Installs the SwiftUI trait on the List row, outside the plugin's rendered content.
struct SwipeActionsRow: ViewModifier {
    @ObservedObject var node: NShiftPluginNode
    let engine: any NShiftEngineTree
    @EnvironmentObject private var theme: SCNTheme

    func body(content: Content) -> some View {
        if node.model.name.rawValue == "SwipeActions" {
            content
                .swipeActions(edge: .leading, allowsFullSwipe: false) {
                    actions(.leading)
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    actions(.trailing)
                }
        } else {
            content
        }
    }

    @ViewBuilder
    private func actions(_ side: SwipeActionsSlot) -> some View {
        ForEach(node.slotChildren[side.slotName] ?? [], id: \.renderId) { action in
            if action.model.name.rawValue == "SwipeAction",
               let metadata = action.model.metadata?.unwrap(as: SwipeActionMetadata.self) {
                Button {
                    fire(.onTap, engine: engine, renderID: action.renderId)
                } label: {
                    if let icon = metadata.icon, let name = SCNIconName(rawValue: icon) {
                        Label(metadata.title, image: name.rawValue)
                    } else {
                        Text(metadata.title)
                    }
                }
                .tint(metadata.variant == "destructive" ? theme.palette.destructive : theme.palette.primary)
            }
        }
    }
}
