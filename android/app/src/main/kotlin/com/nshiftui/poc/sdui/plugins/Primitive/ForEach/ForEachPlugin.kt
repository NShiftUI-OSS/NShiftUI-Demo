package com.nshiftui.poc.sdui.plugins.primitive.foreach

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nshiftui.AnyNShiftMetadata
import com.nshiftui.NShiftNodeView
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftRainbowMetadataDecodeResult
import com.nshiftui.NShiftRainbowMetadataDecodingContext
import com.nshiftui.NShiftRainbowPluginMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel

/**
 * `ForEach(source: "list-id") { template }`: the children are a template
 * rendered once per item of the list [source] (filled by `UpdateListEvent`).
 * Optional filter: items whose [filterPath] value differs from the input
 * [filterInput] are hidden, unless it is empty or equals [filterAll].
 * Optional text search: items whose [searchPath] value does not contain the
 * [searchInput] text are hidden.
 */
@kotlinx.serialization.Serializable
data class ForEachMetadata(
    val source: String = "",
    val spacing: Double = 0.0,
    val filterInput: String = "",
    val filterPath: String = "",
    val filterAll: String = "",
    val searchInput: String = "",
    val searchPath: String = "",
    val template: String = "",
) : NShiftRainbowPluginMetadata {
    override fun decodeRainbowMetadata(
        context: NShiftRainbowMetadataDecodingContext,
    ): NShiftRainbowMetadataDecodeResult =
        NShiftRainbowMetadataDecodeResult(
            metadata = AnyNShiftMetadata(copy(template = context.childrenSource())),
            consumesChildren = true,
        )
}

@NShiftPlugin(
    name = "ForEach",
    version = "1.0.0",
    metadata = ForEachMetadata::class,
)
class ForEachPlugin : NShiftPluginWithMetadata<ForEachMetadata>(
    "ForEach",
    "1.0.0",
    ForEachMetadata::class,
) {
    @Composable
    override fun Content() {
        val tree = requireEngineTree()
        val node = tree.node(renderID) ?: return
        val screen = optionalViewModel<ScreenViewModel>()
        val inputs by (screen?.inputs ?: kotlinx.coroutines.flow.MutableStateFlow(emptyList())).collectAsState()
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(metadata.spacing.dp),
        ) {
            node.children
                .filter { screen?.lists?.isVisible(it.model.id, metadata, inputs) ?: true }
                .forEach { child ->
                    androidx.compose.runtime.key(child.renderId.rawValue) {
                        NShiftNodeView(node = child, engine = tree, viewModel = parentViewModel())
                    }
                }
        }
    }
}
