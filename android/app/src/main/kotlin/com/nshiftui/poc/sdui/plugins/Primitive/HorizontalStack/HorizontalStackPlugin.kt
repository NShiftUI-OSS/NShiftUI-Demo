package com.nshiftui.poc.sdui.plugins.primitive.horizontalstack

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.primitive.StackLayoutMetadata

@NShiftPlugin(
    name = "HorizontalStack",
    version = "1.0.0",
    metadata = StackLayoutMetadata::class,
)
class HorizontalStackPlugin : NShiftPluginWithMetadata<StackLayoutMetadata>(
    "HorizontalStack",
    "1.0.0",
    StackLayoutMetadata::class,
) {
    @Composable
    override fun Content() {
        Row(
            horizontalArrangement = Arrangement.spacedBy(metadata.spacing.dp),
            verticalAlignment = metadata.verticalAlignment(),
        ) {
            children()
        }
    }
}
