import Combine
import Foundation
import NShiftUI

struct ScreenBottomSheet: Identifiable, Equatable {
    let id: String
    var presented: Bool
}

struct ScreenInput: Identifiable, Equatable {
    let id: String
    var value: String
}

private struct PokedexPageResponse: Decodable {
    let results: [PokedexResult]
    let next: String?
}

private struct PokedexResult: Decodable {
    let name: String
    let url: String
}

private struct PokedexPaginationState {
    var offset = 3
    var isLoading = false
    var isExhausted = false
}

@MainActor
protocol ScreenSheetLayer: AnyObject {
    func openSheet(id: String) async -> Bool
    func closeSheet(id: String) async -> Bool
}

protocol ScreenHTTPLayer: AnyObject {
    func sendHTTPRequest(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse
}

@MainActor
final class ScreenViewModel: ObservableObject, NShiftPluginViewModel, ScreenSheetLayer, ScreenHTTPLayer {
    @Published private(set) var bottomSheets: [ScreenBottomSheet] = []
    @Published private(set) var inputs: [ScreenInput] = []
    @Published private(set) var contentRevision = 0

    private let http: any SendHTTPRequestUseCaseProtocol
    private var refreshObserver: ScreenRefreshObserver?
    private var pokedexPagination: [String: PokedexPaginationState] = [:]
    private var presentWaiters: [String: CheckedContinuation<Void, Never>] = [:]
    private var dismissWaiters: [String: CheckedContinuation<Void, Never>] = [:]

    nonisolated init(http: any SendHTTPRequestUseCaseProtocol) {
        self.http = http
    }

    func bind(refresh: ScreenRefreshObserver?) {
        refreshObserver = refresh
    }

    func refresh() async {
        await refreshObserver?.refresh()
    }

    func registerSheet(id: String) {
        guard bottomSheets.contains(where: { $0.id == id }) == false else {
            return
        }
        bottomSheets.append(
            ScreenBottomSheet(
                id: id,
                presented: false
            )
        )
    }

    func unregisterSheet(id: String) {
        bottomSheets.removeAll { $0.id == id }
    }

    func openSheet(id: String) async -> Bool {
        guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
            return false
        }
        bottomSheets[index].presented = true
        await withCheckedContinuation { continuation in
            presentWaiters[id] = continuation
        }
        return true
    }

    func closeSheet(id: String) async -> Bool {
        guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
            return false
        }
        bottomSheets[index].presented = false
        await withCheckedContinuation { continuation in
            dismissWaiters[id] = continuation
        }
        return true
    }

    func didPresent(ids: [String]) {
        resume(
            ids: ids,
            from: &presentWaiters
        )
    }

    func didDismiss(ids: [String]) {
        for id in ids {
            guard let index = bottomSheets.firstIndex(where: { $0.id == id }) else {
                continue
            }
            bottomSheets[index].presented = false
        }
        resume(
            ids: ids,
            from: &dismissWaiters
        )
    }

    func registerInput(
        id: String,
        value: String
    ) {
        if let index = inputs.firstIndex(where: { $0.id == id }) {
            inputs[index].value = value
            return
        }
        inputs.append(
            ScreenInput(
                id: id,
                value: value
            )
        )
    }

    func registerInput(
        engine: (any NShiftEngine)?,
        renderID: NShiftRenderID,
        value: some Any
    ) {
        let id: String
        if let tree = engine as? any NShiftEngineTree,
           let serverID = tree.node(withRenderID: renderID)?.model.id {
            id = serverID
        } else {
            id = renderID.rawValue
        }
        registerInput(
            id: id,
            value: String(describing: value)
        )
    }

    func sendHTTPRequest(
        _ request: SendHTTPRequest
    ) async throws -> SendHTTPResponse {
        try await http.execute(request)
    }

    func appendPokedexPage(
        engine: (any NShiftEngine)?,
        parentID: String,
        endpoint: String,
        limit: Int
    ) async throws -> SendHTTPResponse {
        var state = pokedexPagination[parentID] ?? PokedexPaginationState()
        guard state.isLoading == false, state.isExhausted == false else {
            return SendHTTPResponse(status: 204, body: Data())
        }
        state.isLoading = true
        pokedexPagination[parentID] = state
        defer {
            pokedexPagination[parentID]?.isLoading = false
        }

        let response = try await sendHTTPRequest(
            SendHTTPRequest(
                method: "GET",
                path: endpoint,
                headers: [:],
                query: [
                    "offset": String(state.offset),
                    "limit": String(limit),
                ],
                body: ""
            )
        )
        guard (200..<300).contains(response.status) else {
            return response
        }

        let page = try JSONDecoder().decode(
            PokedexPageResponse.self,
            from: response.body
        )
        guard page.results.isEmpty == false else {
            pokedexPagination[parentID]?.isExhausted = true
            return response
        }

        guard let tree = engine as? any NShiftEngineTree,
              let located = tree.node(withID: parentID),
              let template = located.model.children
                .compactMap(findPokedexCardTemplate)
                .first else {
            return response
        }

        let appended = page.results.map {
            makePokedexCard(from: template, result: $0)
        }
        let children = located.model.children
        var nextChildren = children
        let insertionIndex = children.lastIndex(where: {
            $0.name.rawValue == "Card"
        }).map { $0 + 1 } ?? children.count
        nextChildren.insert(contentsOf: appended, at: insertionIndex)
        tree.replaceChildren(
            pluginID: located.id.rawValue,
            with: nextChildren
        )
        contentRevision += 1

        pokedexPagination[parentID]?.offset += page.results.count
        pokedexPagination[parentID]?.isExhausted = page.next == nil
        return response
    }

    private func makePokedexCard(
        from template: NShiftPluginModel,
        result: PokedexResult
    ) -> NShiftPluginModel {
        var textIndex = 0
        let id = result.url
            .split(separator: "/")
            .last
            .flatMap { Int($0) } ?? 0
        let number = String(format: "%03d", id)
        let imageURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\(id).png"
        return replacePokedexValues(
            in: template,
            name: result.name.capitalized,
            number: number,
            imageURL: imageURL,
            textIndex: &textIndex
        )
    }

    private func replacePokedexValues(
        in model: NShiftPluginModel,
        name: String,
        number: String,
        imageURL: String,
        textIndex: inout Int
    ) -> NShiftPluginModel {
        var next = model
        if model.name.rawValue == "Avatar",
           let avatar = model.metadata?.unwrap(as: AvatarMetadata.self) {
            next = model.replacingMetadata(
                AnyNShiftMetadata(
                    AvatarMetadata(
                        initials: number,
                        size: avatar.size,
                        imageURL: imageURL
                    )
                )
            )
        } else if model.name.rawValue == "Text",
                  let text = model.metadata?.unwrap(as: TextMetadata.self) {
            let replacement: String
            if textIndex == 0 {
                replacement = name
            } else if textIndex == 1 {
                replacement = "#\(number) · PokeAPI"
            } else {
                replacement = text.text
            }
            textIndex += 1
            next = model.replacingMetadata(
                AnyNShiftMetadata(
                    TextMetadata(
                        text: replacement,
                        style: text.style,
                        weight: text.weight,
                        color: text.color,
                        alignment: text.alignment
                    )
                )
            )
        }
        return next.replacingChildren(
            model.children.map {
                replacePokedexValues(
                    in: $0,
                    name: name,
                    number: number,
                    imageURL: imageURL,
                    textIndex: &textIndex
                )
            }
        )
    }

    private func findPokedexCardTemplate(
        in model: NShiftPluginModel
    ) -> NShiftPluginModel? {
        if model.name.rawValue == "Card" {
            return model
        }
        for child in model.children {
            if let match = findPokedexCardTemplate(in: child) {
                return match
            }
        }
        return nil
    }

    private func resume(
        ids: [String],
        from waiters: inout [String: CheckedContinuation<Void, Never>]
    ) {
        for id in ids {
            waiters.removeValue(forKey: id)?.resume()
        }
    }
}
