package com.nshiftui.poc.sdui.plugins.scn.input
import com.nshiftui.poc.sdui.triggers.trackScreenInput
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.store
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.ui.components.SCNTextField

@kotlinx.serialization.Serializable
data class InputMetadata(
    val text: String,
    val placeholder: String,
    val isSecure: Boolean,
) : NShiftMetadata

@NShiftPlugin(
    name = "Input",
    version = "1.0.0",
    metadata = InputMetadata::class,
)
class InputPlugin : NShiftPluginWithMetadata<InputMetadata>(
    "Input",
    "1.0.0",
    InputMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNTextField(
            value = metadata.text,
            onValueChange = { value -> store(metadata.copy(text = value), NShiftTrigger.onChange, scope) },
            placeholder = metadata.placeholder,
            secure = metadata.isSecure,
        )
    }
}
