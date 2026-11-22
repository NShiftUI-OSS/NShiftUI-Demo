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

private struct PokedexDetail: Decodable {
    struct TypeSlot: Decodable {
        struct Named: Decodable {
            let name: String
        }

        let slot: Int
        let type: Named
    }

    let id: Int
    let name: String
    let height: Int
    let weight: Int
    let types: [TypeSlot]
}

/// Bound to the container node instance: a reloaded tree builds new nodes,
/// so its pagination starts again from the first page.
private struct PokedexPaginationState {
    weak var container: NShiftPluginNode?
    var nextOffset = 0
    var isLoading = false
    var endReached = false
}

private enum PokedexCatalog {
    static let typeNames: [String: String] = [
        "normal": "Normal", "fire": "Fogo", "water": "Água",
        "grass": "Grama", "electric": "Elétrico", "ice": "Gelo",
        "fighting": "Lutador", "poison": "Veneno", "ground": "Terrestre",
        "flying": "Voador", "psychic": "Psíquico", "bug": "Inseto",
        "rock": "Pedra", "ghost": "Fantasma", "dragon": "Dragão",
        "dark": "Sombrio", "steel": "Aço", "fairy": "Fada",
    ]

    static func typeName(_ raw: String) -> String {
        typeNames[raw] ?? raw.capitalized
    }

    static func number(_ id: Int) -> String {
        String(format: "%03d", id)
    }

    static func imageURL(_ id: Int) -> String {
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\(id).png"
    }

    static func measure(_ value: Int, unit: String) -> String {
        String(format: "%.1f", Double(value) / 10)
            .replacingOccurrences(of: ".", with: ",") + " \(unit)"
    }
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
        guard let tree = engine as? any NShiftEngineTree,
              let container = tree.node(withID: parentID) else {
            return SendHTTPResponse(status: 204, body: Data())
        }
        let stored = pokedexPagination[parentID]
        let state = stored?.container === container
            ? stored ?? PokedexPaginationState(container: container)
            : PokedexPaginationState(container: container)
        guard state.isLoading == false, state.endReached == false else {
            return SendHTTPResponse(status: 204, body: Data())
        }
        var loading = state
        loading.isLoading = true
        pokedexPagination[parentID] = loading
        defer {
            pokedexPagination[parentID]?.isLoading = false
        }

        let response = try await sendHTTPRequest(
            SendHTTPRequest(
                method: "GET",
                path: endpoint,
                headers: [:],
                query: [
                    "offset": String(state.nextOffset),
                    "limit": String(max(limit, 1)),
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
        let details = try await fetchPokedexDetails(page.results)

        appendPokedexCards(details, tree: tree, parentID: parentID)

        pokedexPagination[parentID]?.nextOffset = state.nextOffset + page.results.count
        pokedexPagination[parentID]?.endReached = page.next == nil || page.results.isEmpty
        return response
    }

    private func fetchPokedexDetails(
        _ results: [PokedexResult]
    ) async throws -> [PokedexDetail] {
        var details: [PokedexDetail] = []
        for result in results {
            let response = try await sendHTTPRequest(
                SendHTTPRequest(
                    method: "GET",
                    path: result.url,
                    headers: [:],
                    query: [:],
                    body: ""
                )
            )
            details.append(
                try JSONDecoder().decode(PokedexDetail.self, from: response.body)
            )
        }
        return details
    }

    private func appendPokedexCards(
        _ details: [PokedexDetail],
        tree: any NShiftEngineTree,
        parentID: String
    ) {
        guard let parent = tree.node(withID: parentID) else {
            return
        }
        let children = parent.model.children
        guard let template = children.first(where: isMultiTypeCard)
            ?? children.first(where: { $0.name.rawValue == "Card" }) else {
            return
        }
        let existing = Set(children.flatMap(pokedexNumbers))
        let fresh = details.filter {
            existing.contains(PokedexCatalog.number($0.id)) == false
        }
        guard fresh.isEmpty == false else {
            return
        }

        let screen = tree.root
        let sheetSlot = ScreenSlot.bottomSheet.slotName
        let sheets = screen.model.slots[sheetSlot] ?? []
        if let sheetTemplate = sheets.first(where: { $0.name.rawValue == "Sheet" }) {
            tree.replaceSlot(
                pluginID: screen.id.rawValue,
                name: sheetSlot,
                with: sheets + fresh.map {
                    makePokedexSheet(from: sheetTemplate, card: template, detail: $0)
                }
            )
        }

        let cards = fresh.map { makePokedexCard(from: template, detail: $0) }
        var nextChildren = children
        let insertionIndex = children.lastIndex(where: {
            $0.name.rawValue == "Card"
        }).map { $0 + 1 } ?? children.count
        nextChildren.insert(contentsOf: cards, at: insertionIndex)
        tree.replaceChildren(
            pluginID: parent.id.rawValue,
            with: nextChildren
        )
        contentRevision += 1
    }

    private func makePokedexCard(
        from template: NShiftPluginModel,
        detail: PokedexDetail
    ) -> NShiftPluginModel {
        var textIndex = 0
        let card = rewritePokedexModel(
            template,
            detail: detail,
            textIndex: &textIndex
        )
        return card.replacingEvents(
            card.events.compactMap(\.event).map {
                NShiftEventModel(
                    name: "OpenBottomSheetEvent",
                    version: "1.0.0",
                    metadata: OpenBottomSheetEventMetadata(
                        sheetID: pokedexSheetID(detail)
                    ),
                    trigger: $0.trigger
                )
            }
        )
    }

    private func makePokedexSheet(
        from template: NShiftPluginModel,
        card: NShiftPluginModel,
        detail: PokedexDetail
    ) -> NShiftPluginModel {
        let number = PokedexCatalog.number(detail.id)
        let types = detail.types
            .sorted { $0.slot < $1.slot }
            .map { PokedexCatalog.typeName($0.type.name) }
            .joined(separator: " · ")
        let lines = [
            "#\(number) · \(types)",
            "Altura \(PokedexCatalog.measure(detail.height, unit: "m")) · Peso \(PokedexCatalog.measure(detail.weight, unit: "kg"))",
        ]
        var textIndex = 0
        let avatar = firstModel(named: "Avatar", in: card).map {
            rewritePokedexModel($0, detail: detail, textIndex: &textIndex)
        }
        textIndex = 0
        var children: [NShiftPluginModel] = template.children.map { child in
            if child.name.rawValue == "Text",
               let text = child.metadata?.unwrap(as: TextMetadata.self) {
                let line = textIndex < lines.count ? lines[textIndex] : text.text
                textIndex += 1
                return child.replacingMetadata(
                    AnyNShiftMetadata(
                        TextMetadata(
                            text: line,
                            style: text.style,
                            weight: text.weight,
                            color: text.color,
                            alignment: text.alignment
                        )
                    )
                )
            }
            if child.name.rawValue == "Button" {
                return child.replacingEvents(
                    child.events.compactMap(\.event).map {
                        NShiftEventModel(
                            name: "CloseBottomSheetEvent",
                            version: "1.0.0",
                            metadata: CloseBottomSheetEventMetadata(
                                sheetID: pokedexSheetID(detail)
                            ),
                            trigger: $0.trigger
                        )
                    }
                )
            }
            return child
        }
        if let avatar {
            children.insert(avatar, at: 0)
        }
        return NShiftPluginModel(
            id: pokedexSheetID(detail),
            name: template.name,
            version: template.version,
            metadata: AnyNShiftMetadata(
                SheetMetadata(title: detail.name.capitalized)
            ),
            style: template.style,
            children: children,
            slots: template.slots,
            events: template.events.compactMap(\.event)
        )
    }

    private func rewritePokedexModel(
        _ model: NShiftPluginModel,
        detail: PokedexDetail,
        textIndex: inout Int
    ) -> NShiftPluginModel {
        let number = PokedexCatalog.number(detail.id)
        switch model.name.rawValue {
        case "Avatar":
            guard let avatar = model.metadata?.unwrap(as: AvatarMetadata.self) else {
                return model
            }
            return model.replacingMetadata(
                AnyNShiftMetadata(
                    AvatarMetadata(
                        initials: number,
                        size: avatar.size,
                        imageURL: PokedexCatalog.imageURL(detail.id)
                    )
                )
            )
        case "Text":
            guard let text = model.metadata?.unwrap(as: TextMetadata.self) else {
                return model
            }
            let replacement: String
            switch textIndex {
            case 0: replacement = detail.name.capitalized
            case 1: replacement = "#\(number) · PokeAPI"
            default: replacement = text.text
            }
            textIndex += 1
            return model.replacingMetadata(
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
        case "Badge":
            return typeBadges(from: model, detail: detail).first ?? model
        case "HorizontalStack" where isTypeStack(model):
            guard let badge = model.children.first else {
                return model
            }
            return model.replacingChildren(typeBadges(from: badge, detail: detail))
        case "Button":
            return model.replacingEvents(
                model.events.compactMap(\.event).map {
                    NShiftEventModel(
                        name: "OpenBottomSheetEvent",
                        version: "1.0.0",
                        metadata: OpenBottomSheetEventMetadata(
                            sheetID: pokedexSheetID(detail)
                        ),
                        trigger: $0.trigger
                    )
                }
            )
        default:
            return model.replacingChildren(
                model.children.map {
                    rewritePokedexModel($0, detail: detail, textIndex: &textIndex)
                }
            )
        }
    }

    private func typeBadges(
        from badge: NShiftPluginModel,
        detail: PokedexDetail
    ) -> [NShiftPluginModel] {
        detail.types
            .sorted { $0.slot < $1.slot }
            .enumerated()
            .map { index, entry in
                badge.replacingMetadata(
                    AnyNShiftMetadata(
                        BadgeMetadata(
                            text: PokedexCatalog.typeName(entry.type.name),
                            variant: index == 0 ? "default" : "outline"
                        )
                    )
                )
            }
    }

    private func pokedexSheetID(_ detail: PokedexDetail) -> String {
        "pokemon-\(detail.id)-details"
    }

    private func isTypeStack(_ model: NShiftPluginModel) -> Bool {
        model.name.rawValue == "HorizontalStack"
            && model.children.isEmpty == false
            && model.children.allSatisfy { $0.name.rawValue == "Badge" }
    }

    private func isMultiTypeCard(_ model: NShiftPluginModel) -> Bool {
        guard model.name.rawValue == "Card" else {
            return false
        }
        func contains(_ node: NShiftPluginModel) -> Bool {
            isTypeStack(node) || node.children.contains(where: contains)
        }
        return contains(model)
    }

    private func pokedexNumbers(in model: NShiftPluginModel) -> [String] {
        guard model.name.rawValue == "Card",
              let avatar = firstModel(named: "Avatar", in: model),
              let metadata = avatar.metadata?.unwrap(as: AvatarMetadata.self) else {
            return []
        }
        return [metadata.initials]
    }

    private func firstModel(
        named name: String,
        in model: NShiftPluginModel
    ) -> NShiftPluginModel? {
        if model.name.rawValue == name {
            return model
        }
        for child in model.children {
            if let match = firstModel(named: name, in: child) {
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

/// The plugin macro resolves a transient `ScreenViewModel` every time SwiftUI
/// rebuilds the Screen struct, while `@StateObject` keeps only the first one.
/// The retained instance registers itself per engine so events (sheets, HTTP
/// pagination) always reach the view model the screen actually renders.
extension ScreenViewModel {
    private final class WeakReference {
        weak var value: ScreenViewModel?

        init(_ value: ScreenViewModel) {
            self.value = value
        }
    }

    private static var active: [ObjectIdentifier: WeakReference] = [:]

    static func activate(_ viewModel: ScreenViewModel, for engine: (any NShiftEngine)?) {
        guard let engine else { return }
        active = active.filter { $0.value.value != nil }
        active[ObjectIdentifier(engine as AnyObject)] = WeakReference(viewModel)
        engine.pluginViewModel = viewModel
    }

    static func resolve(
        engine: (any NShiftEngine)?,
        fallback: (any NShiftPluginViewModel)?
    ) -> ScreenViewModel? {
        if let engine,
           let registered = active[ObjectIdentifier(engine as AnyObject)]?.value {
            return registered
        }
        return fallback as? ScreenViewModel
    }
}
