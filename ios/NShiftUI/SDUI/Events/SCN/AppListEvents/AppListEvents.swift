import NShiftUI

@NShiftMetadata
struct AddListItemEventMetadata: NShiftMetadata, Decodable {
    let listID: String
    let item: [String: String]

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        listID = try container.decodeIfPresent(String.self, forKey: .listID) ?? ""
        item = try container.decodeIfPresent([String: String].self, forKey: .item) ?? [:]
    }

    private enum CodingKeys: String, CodingKey {
        case listID, item
    }
}

/// `AddListItemEvent(listID:, item: (key: "value", ...))`: appends an item to
/// an app-scoped list (`AppLists`), shared by every screen.
@NShiftEvent(
    name: "AddListItemEvent",
    version: "1.0.0",
    metadata: AddListItemEventMetadata.self
)
struct AddListItemEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let listID = metadata.listID
        let item = metadata.item
        guard listID.isEmpty == false else { return }
        await MainActor.run { AppLists.shared.add(item, to: listID) }
        await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
    }
}

@NShiftMetadata
struct ClearListEventMetadata: NShiftMetadata, Decodable {
    let listID: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        listID = try container.decodeIfPresent(String.self, forKey: .listID) ?? ""
    }

    private enum CodingKeys: String, CodingKey {
        case listID
    }
}

/// `ClearListEvent(listID:)`: removes every item of an app-scoped list.
@NShiftEvent(
    name: "ClearListEvent",
    version: "1.0.0",
    metadata: ClearListEventMetadata.self
)
struct ClearListEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        let listID = metadata.listID
        guard listID.isEmpty == false else { return }
        await MainActor.run { AppLists.shared.clear(listID) }
        await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
    }
}

@NShiftMetadata
struct RemoveListItemEventMetadata: NShiftMetadata, Decodable {
    let listID: String
    let entryID: String
}

@NShiftEvent(name: "RemoveListItemEvent", version: "1.0.0", metadata: RemoveListItemEventMetadata.self)
struct RemoveListItemEvent: NShiftEvent {
    func execute() async throws {
        let listID = metadata.listID
        let entryID = metadata.entryID
        guard !listID.isEmpty, !entryID.isEmpty else { return }
        let removed = await MainActor.run { AppLists.shared.remove(entryID: entryID, from: listID) }
        if removed {
            await dispatch(.onComplete, events: events, handler: eventHandler, viewModel: viewModel)
        }
    }
}
