import Combine
import NShiftUI
import SwiftUI

@NShiftMetadata
struct SheetMetadata: NShiftMetadata, Decodable {
    let title: String
}

@NShiftPlugin(
    name: "Sheet",
    version: "1.0.0",
    metadata: SheetMetadata.self
)
struct SheetPlugin: NShiftPlugin {
    @State private var presented = false

    var body: some View {
        if let screen = optionalViewModel(as: ScreenViewModel.self) {
            sheet(screen)
        }
    }

    @ViewBuilder
    private func sheet(
        _ screen: ScreenViewModel
    ) -> some View {
        let ids = sheetIDs
        SCNSheet(
            isPresented: $presented,
            title: metadata.title,
            onPresented: {
                fire(
                    .onPresent,
                    engine: engine,
                    renderID: renderID
                )
                screen.didPresent(ids: ids)
            },
            onDismissed: {
                fire(
                    .onDismiss,
                    engine: engine,
                    renderID: renderID
                )
                screen.didDismiss(ids: ids)
            }
        ) {
            children()
        }
        .onAppear {
            ids.forEach { screen.registerSheet(id: $0) }
        }
        .onDisappear {
            ids.forEach { screen.unregisterSheet(id: $0) }
        }
        .onReceive(sheetStates(screen)) { sheets in
            presented = sheets.contains { sheet in
                ids.contains(sheet.id) && sheet.presented
            }
        }
    }

    private func sheetStates(
        _ viewModel: ScreenViewModel
    ) -> AnyPublisher<[ScreenBottomSheet], Never> {
        viewModel.$bottomSheets.eraseToAnyPublisher()
    }

    private var sheetIDs: [String] {
        var ids = [renderID.rawValue]
        if let tree = engine as? any NShiftEngineTree,
           let serverID = tree.node(withRenderID: renderID)?.model.id {
            ids.append(serverID)
        }
        return ids
    }
}
