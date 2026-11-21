import NShiftUI
import SwiftUI

@NShiftMetadata
struct SelectMetadata: NShiftMetadata, Decodable {
    let options: [String]
    let selection: String
}

@NShiftPlugin(
    name: "Select",
    version: "1.0.0",
    metadata: SelectMetadata.self
)
struct SelectPlugin: NShiftPlugin {
    @EnvironmentObject private var theme: SCNTheme

    var body: some View {
        let options = metadata.options
        let current = themeSelection(
            in: options,
            title: theme.preset.title,
            id: theme.preset.id.rawValue
        ) ?? metadata.selection
        let stored = nshiftBinding(
            .onSelect,
            engine: engine,
            renderID: renderID,
            value: current,
            write: { selection in
                SelectMetadata(
                    options: options,
                    selection: selection
                )
            }
        )
        let selection = Binding<String>(
            get: { stored.wrappedValue },
            set: { newValue in
                if options.allSatisfy({ SCNThemeID.resolve($0) != nil }),
                   let id = SCNThemeID.resolve(newValue) {
                    SCNTheme.shared.applyGlobal(id)
                }
                stored.wrappedValue = newValue
            }
        )
        SCNSelect(
            options: options,
            selection: selection
        )
    }
}

private func themeSelection(in options: [String], title: String, id: String) -> String? {
    guard options.isEmpty == false,
          options.allSatisfy({ SCNThemeID.resolve($0) != nil }) else {
        return nil
    }
    if let match = options.first(where: { $0.caseInsensitiveCompare(title) == .orderedSame }) {
        return match
    }
    return options.first { $0.caseInsensitiveCompare(id) == .orderedSame }
}
