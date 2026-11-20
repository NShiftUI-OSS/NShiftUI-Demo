package com.nshiftui.poc.sdui.plugins.scn.switch
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
import com.nshiftui.poc.ui.components.SCNSwitch

@kotlinx.serialization.Serializable
data class SwitchMetadata(
    val isOn: Boolean,
) : NShiftMetadata

@NShiftPlugin(
    name = "Switch",
    version = "1.0.0",
    metadata = SwitchMetadata::class,
)
class SwitchPlugin : NShiftPluginWithMetadata<SwitchMetadata>(
    "Switch",
    "1.0.0",
    SwitchMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNSwitch(
            isOn = metadata.isOn,
            onChange = { value -> store(metadata.copy(isOn = value), NShiftTrigger.onChange, scope) },
        )
    }
}
