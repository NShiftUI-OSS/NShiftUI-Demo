package com.nshiftui.poc.sdui.plugins.primitive.verticalstack

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.primitive.StackLayoutMetadata

@NShiftPlugin(
    name = "VerticalStack",
    version = "1.0.0",
    metadata = StackLayoutMetadata::class,
)
class VerticalStackPlugin : NShiftPluginWithMetadata<StackLayoutMetadata>(
    "VerticalStack",
    "1.0.0",
    StackLayoutMetadata::class,
) {
    @Composable
    override fun Content() {
        Column(
            verticalArrangement = Arrangement.spacedBy(metadata.spacing.dp),
            horizontalAlignment = metadata.horizontalAlignment(),
        ) {
            children()
        }
    }
}
