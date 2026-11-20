package com.nshiftui.poc.sdui.plugins.scn.slider
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
import com.nshiftui.poc.ui.components.SCNSlider

@kotlinx.serialization.Serializable
data class SliderMetadata(
    val value: Float,
) : NShiftMetadata

@NShiftPlugin(
    name = "Slider",
    version = "1.0.0",
    metadata = SliderMetadata::class,
)
class SliderPlugin : NShiftPluginWithMetadata<SliderMetadata>(
    "Slider",
    "1.0.0",
    SliderMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNSlider(
            value = metadata.value,
            onChange = { value -> store(metadata.copy(value = value), NShiftTrigger.onChange, scope) },
        )
    }
}
