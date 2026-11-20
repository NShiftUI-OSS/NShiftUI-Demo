package com.nshiftui.poc.sdui.plugins.scn.select
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
import com.nshiftui.poc.ui.components.SCNSelect

@kotlinx.serialization.Serializable
data class SelectMetadata(
    val options: List<String>,
    val selection: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "Select",
    version = "1.0.0",
    metadata = SelectMetadata::class,
)
class SelectPlugin : NShiftPluginWithMetadata<SelectMetadata>(
    "Select",
    "1.0.0",
    SelectMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNSelect(
            options = metadata.options,
            selection = metadata.selection,
            onSelect = { value -> store(metadata.copy(selection = value), NShiftTrigger.onSelect, scope) },
        )
    }
}
