import Foundation
import NShiftUI

/// Reads values out of decoded JSON (`JSONSerialization` objects) with dot
/// paths such as `results`, `sprites.other.official-artwork.front_default`
/// or `types.0.type.name`. An empty path returns the value itself.
enum JSONPath {
    static func value(_ root: Any?, at path: String) -> Any? {
        guard path.isEmpty == false else { return root }
        var current = root
        for component in path.split(separator: ".") {
            let key = String(component)
            if let dictionary = current as? [String: Any] {
                current = dictionary[key]
            } else if let array = current as? [Any], let index = Int(key), array.indices.contains(index) {
                current = array[index]
            } else {
                return nil
            }
        }
        return current
    }

    static func string(_ value: Any?) -> String? {
        switch value {
        case let string as String:
            return string
        case let number as NSNumber:
            if CFGetTypeID(number) == CFBooleanGetTypeID() {
                return number.boolValue ? "true" : "false"
            }
            return number.stringValue
        default:
            return nil
        }
    }

    static func number(_ value: Any?) -> Double? {
        switch value {
        case let number as NSNumber:
            return number.doubleValue
        case let string as String:
            return Double(string)
        default:
            return nil
        }
    }
}

/// `{{ expression }}` placeholders. An expression is a JSON path followed by
/// optional filters: `{{name|capitalize}}`, `{{id|pad:3}}`,
/// `{{types|map:type.name|join: · }}`, `{{url|last}}`, `{{x|default:-}}`,
/// `{{height|divide:10|number:1}}`.
enum RainbowTemplate {
    /// Fills every placeholder. With `escaping` the values are escaped for
    /// Rainbow string literals, so data can never break the document.
    /// Fills a URL: values are percent-encoded so user input (a search with
    /// spaces, accents or `&`) cannot break it.
    static func renderURL(_ template: String, context: [String: Any]) -> String {
        render(template, context: context) { value in
            var allowed = CharacterSet.urlQueryAllowed
            allowed.remove(charactersIn: "&=+?#")
            return value.addingPercentEncoding(withAllowedCharacters: allowed) ?? value
        }
    }

    static func render(_ template: String, context: [String: Any], escaping: Bool) -> String {
        render(template, context: context) { escaping ? escape($0) : $0 }
    }

    private static func render(
        _ template: String,
        context: [String: Any],
        transform: (String) -> String
    ) -> String {
        var output = ""
        var rest = Substring(template)
        while let open = rest.range(of: "{{") {
            output += rest[..<open.lowerBound]
            guard let close = rest[open.upperBound...].range(of: "}}") else {
                output += rest[open.lowerBound...]
                return output
            }
            let expression = String(rest[open.upperBound..<close.lowerBound])
            let value = evaluate(expression, context: context)
            output += transform(value)
            rest = rest[close.upperBound...]
        }
        output += rest
        return output
    }

    static func evaluate(_ expression: String, context: [String: Any]) -> String {
        let parts = expression.split(separator: "|", omittingEmptySubsequences: false).map(String.init)
        let path = parts.first?.trimmingCharacters(in: .whitespaces) ?? ""
        var value: Any? = JSONPath.value(context, at: path)
        for filter in parts.dropFirst() {
            let name: String
            let argument: String?
            if let colon = filter.firstIndex(of: ":") {
                name = filter[..<colon].trimmingCharacters(in: .whitespaces)
                argument = String(filter[filter.index(after: colon)...])
            } else {
                name = filter.trimmingCharacters(in: .whitespaces)
                argument = nil
            }
            value = apply(name, argument: argument, to: value)
        }
        if let array = value as? [Any] {
            return array.compactMap(JSONPath.string).joined(separator: ", ")
        }
        return JSONPath.string(value) ?? ""
    }

    private static func apply(_ filter: String, argument: String?, to value: Any?) -> Any? {
        switch filter {
        case "map":
            guard let array = value as? [Any] else { return value }
            return array.compactMap { JSONPath.value($0, at: argument ?? "") }
        case "join":
            guard let array = value as? [Any] else { return value }
            return array.compactMap(JSONPath.string).joined(separator: argument ?? ", ")
        case "first":
            return (value as? [Any])?.first
        case "capitalize":
            guard let text = JSONPath.string(value), let first = text.first else { return value }
            return first.uppercased() + text.dropFirst()
        case "upper":
            return JSONPath.string(value)?.uppercased()
        case "lower":
            return JSONPath.string(value)?.lowercased()
        case "pad":
            guard let text = JSONPath.string(value) else { return value }
            let width = Int(argument?.trimmingCharacters(in: .whitespaces) ?? "") ?? 0
            return String(repeating: "0", count: max(0, width - text.count)) + text
        case "number":
            guard let number = JSONPath.number(value) else { return value }
            let digits = Int(argument?.trimmingCharacters(in: .whitespaces) ?? "") ?? 2
            return String(format: "%.\(digits)f", number)
        case "divide":
            guard let number = JSONPath.number(value),
                  let divisor = Double(argument?.trimmingCharacters(in: .whitespaces) ?? ""),
                  divisor != 0 else { return value }
            return NSNumber(value: number / divisor)
        case "last":
            guard let text = JSONPath.string(value) else { return value }
            return text.split(separator: "/").last.map(String.init) ?? text
        case "default":
            let text = JSONPath.string(value) ?? ""
            return text.isEmpty ? (argument ?? "") : value
        default:
            return value
        }
    }

    private static func escape(_ value: String) -> String {
        value
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "\n", with: "\\n")
    }
}

/// Generic list runtime of a screen. `UpdateListEvent` loads JSON pages into a
/// list id; every `ForEach(source:)` bound to that id renders its template
/// once per item. Nothing here knows what the data or the cards are.
@MainActor
final class ScreenLists {
    private struct State {
        var nextOffset = 0
        var nextURL: String?
        var isLoading = false
        var endReached = false
        var itemCount = 0
    }

    private var states: [String: State] = [:]
    /// Filter and search values of each generated item, by generated model id.
    private var filterValues: [String: String] = [:]
    private var searchValues: [String: String] = [:]

    // MARK: Loading

    func update(
        _ request: UpdateListEventMetadata,
        tree: any NShiftEngineTree,
        screen: ScreenViewModel
    ) async throws -> SendHTTPResponse {
        let listID = request.listID
        let replacing = request.mode == "replace"
        // A replace (new category, new search) must not be lost while a page
        // is loading: it waits for that load. Appends are dropped instead, so
        // repeated scroll triggers never queue up.
        while replacing, states[listID]?.isLoading == true {
            try await Task.sleep(nanoseconds: 50_000_000)
        }
        var state = states[listID] ?? State()
        guard state.isLoading == false else {
            return SendHTTPResponse(status: 204, body: Data())
        }
        if replacing {
            state = State()
        } else if state.endReached {
            return SendHTTPResponse(status: 204, body: Data())
        }
        state.isLoading = true
        states[listID] = state
        defer { states[listID]?.isLoading = false }

        let context = screen.templateContext()
        var response = SendHTTPResponse(status: 204, body: Data())
        var replaceNext = replacing
        for _ in 0..<max(request.maxPages, 1) {
            var query: [String: String] = [:]
            let url: String
            if replaceNext == false, let next = state.nextURL {
                url = next
            } else {
                url = RainbowTemplate.renderURL(request.url, context: context)
                if request.pageSize > 0 {
                    query[request.offsetParameter] = String(state.nextOffset)
                    query[request.limitParameter] = String(request.pageSize)
                }
            }
            response = try await screen.sendHTTPRequest(
                SendHTTPRequest(method: "GET", path: url, headers: request.headers, query: query, body: "")
            )
            guard (200..<300).contains(response.status) else { return response }
            let json = try JSONSerialization.jsonObject(with: response.body, options: [.fragmentsAllowed])
            var items = Self.items(in: JSONPath.value(json, at: request.itemsPath))
            if request.expandPath.isEmpty == false {
                items = try await expand(items, path: request.expandPath, screen: screen)
            }

            let added = materialize(
                items,
                listID: listID,
                startIndex: replaceNext ? 0 : state.itemCount,
                replacing: replaceNext,
                tree: tree,
                context: context
            )
            replaceNext = false
            state.itemCount += items.count
            state.nextOffset += items.count
            if request.nextPath.isEmpty == false {
                state.nextURL = JSONPath.string(JSONPath.value(json, at: request.nextPath))
                state.endReached = state.nextURL == nil || items.isEmpty
            } else if request.pageSize > 0 {
                let total = JSONPath.number(JSONPath.value(json, at: request.totalPath))
                state.endReached = items.isEmpty || total.map { Double(state.nextOffset) >= $0 } == true
            } else {
                state.endReached = true
            }
            state.isLoading = true
            states[listID] = state

            // With a ForEach filter active a page may add nothing visible: keep
            // loading (one request at a time) up to `maxPages` per trigger.
            let showsSomething = added.contains { item in
                isVisible(item.id, filter: item.filter, inputs: screen.inputs)
            }
            if state.endReached || showsSomething || added.isEmpty {
                break
            }
        }
        return response
    }

    private static func items(in value: Any?) -> [Any] {
        if let array = value as? [Any] { return array }
        if let value { return [value] }
        return []
    }

    /// Replaces each item with the object found at its `path` URL, keeping the
    /// item's own fields that the fetched object does not have.
    private func expand(_ items: [Any], path: String, screen: ScreenViewModel) async throws -> [Any] {
        var expanded: [Any] = []
        for item in items {
            guard let url = JSONPath.string(JSONPath.value(item, at: path)) else {
                expanded.append(item)
                continue
            }
            let response = try await screen.sendHTTPRequest(
                SendHTTPRequest(method: "GET", path: url, headers: [:], query: [:], body: "")
            )
            guard (200..<300).contains(response.status),
                  var fetched = try JSONSerialization.jsonObject(with: response.body) as? [String: Any] else {
                expanded.append(item)
                continue
            }
            if let original = item as? [String: Any] {
                for (key, value) in original where fetched[key] == nil {
                    fetched[key] = value
                }
            }
            expanded.append(fetched)
        }
        return expanded
    }

    // MARK: Rendering items

    private struct AddedItem {
        let id: String
        let filter: ForEachMetadata
    }

    /// Compiles each `ForEach` template bound to `listID` once per item and
    /// adds the result to the tree (only the new nodes are created).
    private func materialize(
        _ items: [Any],
        listID: String,
        startIndex: Int,
        replacing: Bool,
        tree: any NShiftEngineTree,
        context: [String: Any]
    ) -> [AddedItem] {
        var added: [AddedItem] = []
        for node in Self.forEachNodes(boundTo: listID, in: tree.root) {
            guard let metadata = node.model.metadata?.unwrap(as: ForEachMetadata.self) else { continue }
            var models: [NShiftPluginModel] = []
            for (offset, item) in items.enumerated() {
                let index = startIndex + offset
                var itemContext = context
                if let fields = item as? [String: Any] {
                    itemContext.merge(fields) { _, field in field }
                }
                itemContext["item"] = item
                itemContext["index"] = index
                let source = RainbowTemplate.render(metadata.template, context: itemContext, escaping: true)
                guard let compiled = try? NShiftRainbowCompiler().compileAll(source: source) else { continue }
                for (position, model) in compiled.enumerated() {
                    let id = compiled.count == 1 ? "\(listID)#\(index)" : "\(listID)#\(index).\(position)"
                    models.append(Self.model(model, withID: id))
                    if metadata.filterPath.isEmpty == false {
                        filterValues[id] = JSONPath.string(JSONPath.value(item, at: metadata.filterPath)) ?? ""
                    }
                    if metadata.searchPath.isEmpty == false {
                        searchValues[id] = JSONPath.string(JSONPath.value(item, at: metadata.searchPath)) ?? ""
                    }
                    added.append(AddedItem(id: id, filter: metadata))
                }
            }
            if replacing {
                tree.replaceChildren(pluginID: node.id.rawValue, with: models)
            } else if models.isEmpty == false {
                tree.insertChildren(pluginID: node.id.rawValue, at: node.children.count, with: models)
            }
        }
        return added
    }

    private static func forEachNodes(boundTo listID: String, in node: NShiftPluginNode) -> [NShiftPluginNode] {
        var found: [NShiftPluginNode] = []
        if node.model.name.rawValue == "ForEach",
           node.model.metadata?.unwrap(as: ForEachMetadata.self)?.source == listID {
            found.append(node)
        }
        for child in node.children {
            found += forEachNodes(boundTo: listID, in: child)
        }
        for slot in node.slotChildren.values {
            for child in slot {
                found += forEachNodes(boundTo: listID, in: child)
            }
        }
        return found
    }

    private static func model(_ model: NShiftPluginModel, withID id: String) -> NShiftPluginModel {
        NShiftPluginModel(
            id: id,
            name: model.name,
            version: model.version,
            metadata: model.metadata,
            style: model.style,
            children: model.children,
            slots: model.slots,
            events: model.events.compactMap(\.event)
        )
    }

    // MARK: Filtering

    /// Whether a generated item passes its `ForEach` filter for the current
    /// value of the filter input.
    func isVisible(_ itemID: String?, filter: ForEachMetadata, inputs: [ScreenInput]) -> Bool {
        guard let itemID else { return true }
        if filter.filterInput.isEmpty == false {
            let selection = inputs.first { $0.id == filter.filterInput }?.value ?? ""
            let showsAll = selection.isEmpty || selection.caseInsensitiveCompare(filter.filterAll) == .orderedSame
            if showsAll == false, filterValues[itemID]?.caseInsensitiveCompare(selection) != .orderedSame {
                return false
            }
        }
        if filter.searchInput.isEmpty == false {
            let query = (inputs.first { $0.id == filter.searchInput }?.value ?? "")
                .trimmingCharacters(in: .whitespaces)
            if query.isEmpty == false,
               (searchValues[itemID] ?? "").range(of: query, options: [.caseInsensitive, .diacriticInsensitive]) == nil {
                return false
            }
        }
        return true
    }
}
