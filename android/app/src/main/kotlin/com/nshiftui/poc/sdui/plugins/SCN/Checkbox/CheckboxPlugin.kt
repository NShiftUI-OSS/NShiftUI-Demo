package com.nshiftui.poc.sdui.plugins.scn.checkbox
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
import com.nshiftui.poc.ui.components.SCNCheckbox

@kotlinx.serialization.Serializable
data class CheckboxMetadata(
    val title: String,
    val isOn: Boolean,
) : NShiftMetadata

@NShiftPlugin(
    name = "Checkbox",
    version = "1.0.0",
    metadata = CheckboxMetadata::class,
)
class CheckboxPlugin : NShiftPluginWithMetadata<CheckboxMetadata>(
    "Checkbox",
    "1.0.0",
    CheckboxMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNCheckbox(
            title = metadata.title,
            isOn = metadata.isOn,
            onChange = { value -> store(metadata.copy(isOn = value), NShiftTrigger.onChange, scope) },
        )
    }
}
