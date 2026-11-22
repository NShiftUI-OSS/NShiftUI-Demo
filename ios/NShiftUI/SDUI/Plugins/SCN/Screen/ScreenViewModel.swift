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

private struct ProductPageResponse: Decodable {
    let products: [Product]
    let total: Int
    let skip: Int
}

private struct Product: Decodable {
    let title: String
    let category: String
    let price: Double
    let stock: Int
    let discountPercentage: Double
}

private enum ProductCatalog {
    static func categoryName(_ raw: String) -> String {
        switch raw {
        case "laptops", "smartphones", "tablets", "mobile-accessories":
            return "Tecnologia"
        case "beauty", "fragrances", "skin-care":
            return "Beleza"
        case "furniture", "home-decoration", "kitchen-accessories":
            return "Casa"
        case "groceries":
            return "Mercado"
        case "sports-accessories":
            return "Esportes"
        case "motorcycle", "vehicle":
            return "Veículos"
        case "womens-bags":
            return "Viagem"
        default:
            return raw.hasPrefix("mens-") || raw.hasPrefix("womens-") || raw == "tops" || raw == "sunglasses"
                ? "Moda"
                : raw.capitalized
        }
    }

    static func price(_ value: Double) -> String {
        "US$ " + String(format: "%.2f", value).replacingOccurrences(of: ".", with: ",")
    }

    static func badge(for product: Product) -> (text: String, variant: String) {
        if product.stock < 10 {
            return ("Últimas unidades", "destructive")
        }
        if product.discountPercentage >= 15 {
            return ("Oferta", "default")
        }
        return ("Em estoque", "secondary")
    }
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
    @Published private(set) var routeParameters: [String: String] = [:]

    private let http: any SendHTTPRequestUseCaseProtocol
    private var refreshObserver: ScreenRefreshObserver?
    private var sheetRegistrations: [String: Int] = [:]
    private var pokedexPagination: [String: PokedexPaginationState] = [:]
    private var loadedRouteKeys: Set<String> = []
    private var presentWaiters: [String: CheckedContinuation<Void, Never>] = [:]
    private var dismissWaiters: [String: CheckedContinuation<Void, Never>] = [:]

    nonisolated init(http: any SendHTTPRequestUseCaseProtocol) {
        self.http = http
    }

    func bindRouteParameters(_ parameters: [String: String]) {
        routeParameters = parameters
    }

    func bind(refresh: ScreenRefreshObserver?) {
        refreshObserver = refresh
    }

    func refresh() async {
        await refreshObserver?.refresh()
    }

    /// Sheets are counted per id: when SwiftUI rebuilds a view, the new sheet
    /// can appear before the old one disappears, and both share the same id.
    func registerSheet(id: String) {
        sheetRegistrations[id, default: 0] += 1
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
        let remaining = (sheetRegistrations[id] ?? 1) - 1
        guard remaining <= 0 else {
            sheetRegistrations[id] = remaining
            return
        }
        sheetRegistrations[id] = nil
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

    func loadRouteParameters(
        engine: (any NShiftEngine)?
    ) async {
        guard routeParameters["resource"] == "pokemon",
              let rawID = routeParameters["id"],
              let id = Int(rawID),
              let tree = engine as? any NShiftEngineTree,
              let container = tree.root.children.first(where: {
                  $0.model.name.rawValue == "VerticalStack"
              }) else {
            return
        }
        let key = "pokemon:\(id)"
        guard loadedRouteKeys.insert(key).inserted else { return }
        do {
            let response = try await sendHTTPRequest(
                SendHTTPRequest(
                    method: "GET",
                    path: "https://pokeapi.co/api/v2/pokemon/\(id)",
                    headers: [:],
                    query: [:],
                    body: ""
                )
            )
            let detail = try JSONDecoder().decode(
                PokedexDetail.self,
                from: response.body
            )
            var textIndex = 0
            let children = container.model.children.map {
                rewritePokedexModel(
                    $0,
                    detail: detail,
                    textIndex: &textIndex
                )
            }
            tree.replaceChildren(
                pluginID: container.id.rawValue,
                with: children
            )
        } catch {
            loadedRouteKeys.remove(key)
        }
    }

    /// Loads the next page of `endpoint` into the container `parentID`.
    /// Supports PokeAPI (`results`) and DummyJSON (`products`) pages.
    func appendPage(
        engine: (any NShiftEngine)?,
        parentID: String,
        endpoint: String,
        limit: Int,
        offsetParameter: String = "offset"
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
                    offsetParameter: String(state.nextOffset),
                    "limit": String(max(limit, 1)),
                ],
                body: ""
            )
        )
        guard (200..<300).contains(response.status) else {
            return response
        }
        if var products = try? JSONDecoder().decode(
            ProductPageResponse.self,
            from: response.body
        ) {
            // With a filter active, a page may add nothing the user can see.
            // Keep fetching (one request at a time, at most 5 pages per
            // gesture) until something visible is added or the catalog ends.
            let selection = CardMetadata.selection(in: inputs)
            var offset = state.nextOffset
            var fetched = 0
            while true {
                let added = appendProductCards(products.products, tree: tree, parentID: parentID)
                offset += products.products.count
                fetched += 1
                let endReached = products.products.isEmpty
                    || products.skip + products.products.count >= products.total
                let showsSomething = added.contains {
                    CardMetadata(filter: $0).isVisible(for: selection)
                }
                pokedexPagination[parentID]?.nextOffset = offset
                pokedexPagination[parentID]?.endReached = endReached
                if endReached || showsSomething || fetched >= 5 {
                    return response
                }
                let next = try await sendHTTPRequest(
                    SendHTTPRequest(
                        method: "GET",
                        path: endpoint,
                        headers: [:],
                        query: [
                            offsetParameter: String(offset),
                            "limit": String(max(limit, 1)),
                        ],
                        body: ""
                    )
                )
                guard (200..<300).contains(next.status) else {
                    return next
                }
                products = try JSONDecoder().decode(ProductPageResponse.self, from: next.body)
            }
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
            tree.appendSlot(
                pluginID: screen.id.rawValue,
                name: sheetSlot,
                with: fresh.map {
                    makePokedexSheet(from: sheetTemplate, card: template, detail: $0)
                }
            )
        }

        // Insert only the new cards: existing card nodes keep their identity,
        // so their rendered rows are not rebuilt on every page.
        let cards = fresh.map { makePokedexCard(from: template, detail: $0) }
        let insertionIndex = children.lastIndex(where: {
            $0.name.rawValue == "Card"
        }).map { $0 + 1 } ?? children.count
        tree.insertChildren(
            pluginID: parent.id.rawValue,
            at: insertionIndex,
            with: cards
        )
    }

    /// Appends product cards and returns the filter category of each one added.
    @discardableResult
    private func appendProductCards(
        _ products: [Product],
        tree: any NShiftEngineTree,
        parentID: String
    ) -> [String] {
        guard let parent = tree.node(withID: parentID) else { return [] }
        let children = parent.model.children
        guard let template = children.last(where: { $0.name.rawValue == "Card" }) else {
            return []
        }
        let existing = Set(children.compactMap { firstText(in: $0) })
        let fresh = products.filter { existing.contains($0.title) == false }
        let cards = fresh.map { makeProductCard(from: template, product: $0) }
        guard cards.isEmpty == false else { return [] }
        let insertionIndex = children.lastIndex(where: {
            $0.name.rawValue == "Card"
        }).map { $0 + 1 } ?? children.count
        tree.insertChildren(
            pluginID: parent.id.rawValue,
            at: insertionIndex,
            with: cards
        )
        return fresh.map { ProductCatalog.categoryName($0.category) }
    }

    private func makeProductCard(
        from template: NShiftPluginModel,
        product: Product
    ) -> NShiftPluginModel {
        let category = ProductCatalog.categoryName(product.category)
        let badge = ProductCatalog.badge(for: product)
        var textIndex = 0
        func rewrite(_ model: NShiftPluginModel) -> NShiftPluginModel {
            var next = model
            switch model.name.rawValue {
            case "Card":
                next = model.replacingMetadata(
                    AnyNShiftMetadata(CardMetadata(filter: category))
                )
            case "Text":
                if let text = model.metadata?.unwrap(as: TextMetadata.self) {
                    let value: String
                    switch textIndex {
                    case 0: value = product.title
                    case 1: value = "\(category) · \(ProductCatalog.price(product.price))"
                    default: value = text.text
                    }
                    textIndex += 1
                    next = model.replacingMetadata(
                        AnyNShiftMetadata(
                            TextMetadata(
                                text: value,
                                style: text.style,
                                weight: text.weight,
                                color: text.color,
                                alignment: text.alignment
                            )
                        )
                    )
                }
            case "Badge":
                next = model.replacingMetadata(
                    AnyNShiftMetadata(BadgeMetadata(text: badge.text, variant: badge.variant))
                )
            default:
                break
            }
            return next.replacingChildren(model.children.map(rewrite))
        }
        return rewrite(template)
    }

    private func firstText(in model: NShiftPluginModel) -> String? {
        guard model.name.rawValue == "Card",
              let text = firstModel(named: "Text", in: model)?
                .metadata?.unwrap(as: TextMetadata.self) else {
            return nil
        }
        return text.text
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
        return navigatingToDetails(card, detail: detail)
    }

    /// Points the card's actions (and those of any button inside it) to the
    /// details screen of `detail`. Kept out of `rewritePokedexModel`, which only
    /// fills in data, so screens reusing it keep their own actions.
    private func navigatingToDetails(
        _ model: NShiftPluginModel,
        detail: PokedexDetail
    ) -> NShiftPluginModel {
        var next = model
        if model.name.rawValue == "Card" || model.name.rawValue == "Button" {
            next = model.replacingEvents(
                model.events.compactMap(\.event).map {
                    NShiftEventModel(
                        name: "NavigateEvent",
                        version: "1.0.0",
                        metadata: NavigateEventMetadata(
                            screenName: "pokemon-details",
                            parameters: [
                                "resource": "pokemon",
                                "id": String(detail.id),
                            ]
                        ),
                        trigger: $0.trigger
                    )
                }
            )
        }
        return next.replacingChildren(
            model.children.map { navigatingToDetails($0, detail: detail) }
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
