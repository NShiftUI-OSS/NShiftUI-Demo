import Foundation
import NShiftUI

/// Loads JSON into the list `listID`, rendered by the `ForEach(source:)`
/// bound to it. `url` accepts `{{route.x}}` / `{{input.x}}` placeholders.
/// Pagination: follow the URL at `nextPath`, or send `offsetParameter` /
/// `limitParameter` with `pageSize` (ending at `totalPath`). `expandPath`
/// replaces each item with the object found at that URL field.
/// `mode`: "append" (default, next page) or "replace" (reload from start).
@NShiftMetadata
struct UpdateListEventMetadata: NShiftMetadata, Decodable {
    let listID: String
    let url: String
    let headers: [String: String]
    let itemsPath: String
    let mode: String
    let pageSize: Int
    let offsetParameter: String
    let limitParameter: String
    let nextPath: String
    let totalPath: String
    let expandPath: String
    let maxPages: Int

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        listID = try container.decodeIfPresent(String.self, forKey: .listID) ?? ""
        url = try container.decodeIfPresent(String.self, forKey: .url) ?? ""
        headers = try container.decodeIfPresent([String: String].self, forKey: .headers) ?? [:]
        itemsPath = try container.decodeIfPresent(String.self, forKey: .itemsPath) ?? ""
        mode = try container.decodeIfPresent(String.self, forKey: .mode) ?? "append"
        pageSize = try container.decodeIfPresent(Int.self, forKey: .pageSize) ?? 0
        offsetParameter = try container.decodeIfPresent(String.self, forKey: .offsetParameter) ?? "offset"
        limitParameter = try container.decodeIfPresent(String.self, forKey: .limitParameter) ?? "limit"
        nextPath = try container.decodeIfPresent(String.self, forKey: .nextPath) ?? ""
        totalPath = try container.decodeIfPresent(String.self, forKey: .totalPath) ?? ""
        expandPath = try container.decodeIfPresent(String.self, forKey: .expandPath) ?? ""
        maxPages = try container.decodeIfPresent(Int.self, forKey: .maxPages) ?? 1
    }

    private enum CodingKeys: String, CodingKey {
        case listID, url, headers, itemsPath, mode, pageSize, offsetParameter
        case limitParameter, nextPath, totalPath, expandPath, maxPages
    }
}

@NShiftEvent(
    name: "UpdateListEvent",
    version: "1.0.0",
    metadata: UpdateListEventMetadata.self
)
struct UpdateListEvent: NShiftEvent {
    func execute() async throws {
        let nested = events
        let handler = eventHandler
        do {
            let response = try await Self.run(metadata, engine: engine, fallback: viewModel)
            guard let response else {
                await dispatch(.onFailure, events: nested, handler: handler, viewModel: viewModel)
                return
            }
            if (200..<300).contains(response.status) {
                await dispatch(.onComplete, events: nested, handler: handler, viewModel: viewModel)
            }
        } catch {
            await dispatch(.onFailure, events: nested, handler: handler, viewModel: viewModel)
        }
    }

    @MainActor
    private static func run(
        _ request: UpdateListEventMetadata,
        engine: (any NShiftEngine)?,
        fallback: (any NShiftPluginViewModel)?
    ) async throws -> SendHTTPResponse? {
        guard let screen = ScreenViewModel.resolve(engine: engine, fallback: fallback),
              let tree = engine as? any NShiftEngineTree else {
            return nil
        }
        return try await screen.lists.update(request, tree: tree, screen: screen)
    }
}
