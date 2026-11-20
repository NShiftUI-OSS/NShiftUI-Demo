package com.nshiftui.poc.sdui.plugins.scn.textarea
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
import com.nshiftui.poc.ui.components.SCNTextArea

@kotlinx.serialization.Serializable
data class TextareaMetadata(
    val text: String,
    val placeholder: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "Textarea",
    version = "1.0.0",
    metadata = TextareaMetadata::class,
)
class TextareaPlugin : NShiftPluginWithMetadata<TextareaMetadata>(
    "Textarea",
    "1.0.0",
    TextareaMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNTextArea(
            value = metadata.text,
            onValueChange = { value -> store(metadata.copy(text = value), NShiftTrigger.onChange, scope) },
            placeholder = metadata.placeholder,
        )
    }
}
