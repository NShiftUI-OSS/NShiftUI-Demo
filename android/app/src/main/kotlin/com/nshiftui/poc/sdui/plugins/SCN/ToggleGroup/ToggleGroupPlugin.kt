package com.nshiftui.poc.sdui.plugins.scn.togglegroup
import com.nshiftui.poc.sdui.triggers.trackScreenInput
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.store
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNToggleGroup

@kotlinx.serialization.Serializable
data class ToggleGroupMetadata(
    val options: List<String>,
    val selection: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "ToggleGroup",
    version = "1.0.0",
    metadata = ToggleGroupMetadata::class,
)
class ToggleGroupPlugin : NShiftPluginWithMetadata<ToggleGroupMetadata>(
    "ToggleGroup",
    "1.0.0",
    ToggleGroupMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNToggleGroup(
            options = metadata.options,
            selection = metadata.selection,
            onSelect = { value -> store(metadata.copy(selection = value), NShiftTrigger.onSelect, scope) },
        )
    }
}
