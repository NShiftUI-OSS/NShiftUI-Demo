package com.nshiftui.poc.sdui.plugins.primitive.layerstack

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.primitive.StackLayoutMetadata

@NShiftPlugin(
    name = "LayerStack",
    version = "1.0.0",
    metadata = StackLayoutMetadata::class,
)
class LayerStackPlugin : NShiftPluginWithMetadata<StackLayoutMetadata>(
    "LayerStack",
    "1.0.0",
    StackLayoutMetadata::class,
) {
    @Composable
    override fun Content() {
        Box(contentAlignment = metadata.layerAlignment()) {
            children()
        }
    }
}
