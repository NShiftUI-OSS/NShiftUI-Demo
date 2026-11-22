import NShiftUI

@NShiftMetadata
struct OpenBottomSheetEventMetadata: NShiftMetadata, Decodable {
    let sheetID: String
}

@NShiftEvent(
    name: "OpenBottomSheetEvent",
    version: "1.0.0",
    metadata: OpenBottomSheetEventMetadata.self
)
struct OpenBottomSheetEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let sheetID = metadata.sheetID
        let sheets = await ScreenViewModel.resolve(engine: engine, fallback: viewModel)
        guard let sheets else {
            return
        }
        let opened = await sheets.openSheet(id: sheetID)
        guard opened else { return }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}
