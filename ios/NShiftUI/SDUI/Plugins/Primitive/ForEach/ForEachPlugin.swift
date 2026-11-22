import NShiftUI
import SwiftUI

/// `ForEach(source: "list-id") { template }`: its children are not rendered
/// directly; they are a template rendered once per item of the list
/// `source` (filled by `UpdateListEvent`). Optional filter: items whose
/// `filterPath` value differs from the input `filterInput` are hidden, unless
/// the input is empty or equals `filterAll`. Optional text search: items
/// whose `searchPath` value does not contain the `searchInput` text are hidden.
@NShiftMetadata
struct ForEachMetadata: NShiftMetadata, Decodable, NShiftRainbowPluginMetadata {
    let source: String
    let spacing: Double
    let filterInput: String
    let filterPath: String
    let filterAll: String
    let searchInput: String
    let searchPath: String
    let template: String

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        source = try container.decodeIfPresent(String.self, forKey: .source) ?? ""
        if let double = try? container.decodeIfPresent(Double.self, forKey: .spacing) {
            spacing = double
        } else {
            spacing = Double(try container.decodeIfPresent(Int.self, forKey: .spacing) ?? 0)
        }
        filterInput = try container.decodeIfPresent(String.self, forKey: .filterInput) ?? ""
        filterPath = try container.decodeIfPresent(String.self, forKey: .filterPath) ?? ""
        filterAll = try container.decodeIfPresent(String.self, forKey: .filterAll) ?? ""
        searchInput = try container.decodeIfPresent(String.self, forKey: .searchInput) ?? ""
        searchPath = try container.decodeIfPresent(String.self, forKey: .searchPath) ?? ""
        template = try container.decodeIfPresent(String.self, forKey: .template) ?? ""
    }

    private init(copy: ForEachMetadata, template: String) {
        source = copy.source
        spacing = copy.spacing
        filterInput = copy.filterInput
        filterPath = copy.filterPath
        filterAll = copy.filterAll
        searchInput = copy.searchInput
        searchPath = copy.searchPath
        self.template = template
    }

    private enum CodingKeys: String, CodingKey {
        case source, spacing, filterInput, filterPath, filterAll, searchInput, searchPath, template
    }

    func decodeRainbowMetadata(
        with context: NShiftRainbowMetadataDecodingContext
    ) throws -> NShiftRainbowMetadataDecodeResult {
        NShiftRainbowMetadataDecodeResult(
            metadata: AnyNShiftMetadata(ForEachMetadata(copy: self, template: context.childrenSource())),
            consumesChildren: true
        )
    }
}

@NShiftPlugin(
    name: "ForEach",
    version: "1.0.0",
    metadata: ForEachMetadata.self
)
struct ForEachPlugin: NShiftPlugin {
    var body: some View {
        if let tree = engine as? any NShiftEngineTree,
           let node = tree.node(withRenderID: renderID),
           let screen = optionalViewModel(as: ScreenViewModel.self) {
            ForEachItems(node: node, screen: screen, engine: tree, metadata: metadata, viewModel: viewModel)
        }
    }
}

/// The generated items of a `ForEach`, observed so new items appear as they
/// are added and filtered as the filter input changes.
struct ForEachItems: View {
    @ObservedObject var node: NShiftPluginNode
    @ObservedObject var screen: ScreenViewModel
    let engine: any NShiftEngineTree
    let metadata: ForEachMetadata
    let viewModel: (any NShiftPluginViewModel)?

    var body: some View {
        VStack(alignment: .leading, spacing: metadata.spacing) {
            ForEach(visibleItems, id: \.renderId) { child in
                NShiftNodeView(node: child, engine: engine, viewModel: viewModel)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    var visibleItems: [NShiftPluginNode] {
        node.children.filter {
            screen.lists.isVisible($0.model.id, filter: metadata, inputs: screen.inputs)
        }
    }
}
