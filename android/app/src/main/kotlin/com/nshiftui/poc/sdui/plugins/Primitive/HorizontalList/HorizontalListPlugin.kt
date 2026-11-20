package com.nshiftui.poc.sdui.plugins.primitive.horizontallist

import androidx.compose.runtime.Composable
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import com.nshiftui.NShiftNodeView
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "HorizontalList",
    version = "1.0.0",
)
class HorizontalListPlugin : NShiftPluginWithViewModel(
    "HorizontalList",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        val nodes = requireEngineTree().node(renderID)?.children.orEmpty()
        LazyRow {
            items(
                items = nodes,
                key = { node -> node.renderId.rawValue },
            ) { node ->
                NShiftNodeView(
                    node = node,
                    engine = requireEngineTree(),
                    viewModel = parentViewModel(),
                )
            }
        }
    }
}
