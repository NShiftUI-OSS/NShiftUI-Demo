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
    @State private var selectedInput = ""

    var body: some View {
        let options = metadata.options
        let screen = optionalViewModel(as: ScreenViewModel.self)
        let inputValue = screen?.inputs.first {
            $0.id == inputID
        }?.value
        let current = themeSelection(
            in: options,
            title: theme.preset.title,
            id: theme.preset.id.rawValue
        )
        ?? inputValue
        ?? (selectedInput.isEmpty ? metadata.selection : selectedInput)
        let selection = Binding<String>(
            get: { current },
            set: { newValue in
                if options.allSatisfy({ SCNThemeID.resolve($0) != nil }),
                   let id = SCNThemeID.resolve(newValue) {
                    SCNTheme.shared.applyGlobal(id)
                }
                selectedInput = newValue
                screen?.registerInput(
                    engine: engine,
                    renderID: renderID,
                    value: newValue
                )
                storeThenFire(
                    .onSelect,
                    engine: engine,
                    renderID: renderID,
                    metadata: SelectMetadata(
                        options: options,
                        selection: newValue
                    )
                )
            }
        )
        let select = SCNSelect(
            options: options,
            selection: selection
        )
        if let screen {
            select.onReceive(screen.$inputs) { inputs in
                selectedInput = inputs.first {
                    $0.id == inputID
                }?.value ?? ""
            }
        } else {
            select
        }
    }

    private var inputID: String {
        if let tree = engine as? any NShiftEngineTree,
           let id = tree.node(withRenderID: renderID)?.model.id {
            return id
        }
        return renderID.rawValue
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
