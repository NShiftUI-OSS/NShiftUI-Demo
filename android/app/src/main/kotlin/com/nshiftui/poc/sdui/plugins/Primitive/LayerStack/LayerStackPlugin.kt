package com.nshiftui.poc.sdui.plugins.primitive.layerstack

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "LayerStack",
    version = "1.0.0",
)
class LayerStackPlugin : NShiftPluginWithViewModel(
    "LayerStack",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        Box {
            children()
        }
    }
}
