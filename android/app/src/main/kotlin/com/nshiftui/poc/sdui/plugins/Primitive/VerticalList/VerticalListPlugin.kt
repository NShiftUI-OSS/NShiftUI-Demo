package com.nshiftui.poc.sdui.plugins.primitive.verticallist

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.Modifier
import com.nshiftui.NShiftNodeView
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "VerticalList",
    version = "1.0.0",
)
class VerticalListPlugin : NShiftPluginWithViewModel(
    "VerticalList",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        val nodes = requireEngineTree().node(renderID)?.children.orEmpty()
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
        ) {
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
