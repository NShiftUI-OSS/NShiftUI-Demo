package com.nshiftui.poc.sdui.plugins.scn.item
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNItem

@kotlinx.serialization.Serializable
data class ItemMetadata(
    val title: String,
    val subtitle: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "Item",
    version = "1.0.0",
    metadata = ItemMetadata::class,
)
class ItemPlugin : NShiftPluginWithMetadata<ItemMetadata>(
    "Item",
    "1.0.0",
    ItemMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNItem(
            title = metadata.title,
            subtitle = metadata.subtitle,
        )
    }
}
