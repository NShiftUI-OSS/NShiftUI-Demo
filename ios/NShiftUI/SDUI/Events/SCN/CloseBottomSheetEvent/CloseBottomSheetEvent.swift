import NShiftUI

@NShiftMetadata
struct CloseBottomSheetEventMetadata: NShiftMetadata, Decodable {
    let sheetID: String
}

@NShiftEvent(
    name: "CloseBottomSheetEvent",
    version: "1.0.0",
    metadata: CloseBottomSheetEventMetadata.self
)
struct CloseBottomSheetEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let sheetID = metadata.sheetID
        let sheets = viewModel as? ScreenViewModel
        guard let sheets else {
            return
        }
        let closed = await sheets.closeSheet(id: sheetID)
        guard closed else { return }
        await dispatch(
            .onComplete,
            events: nested,
            handler: handler,
            viewModel: viewModel
        )
    }
}
