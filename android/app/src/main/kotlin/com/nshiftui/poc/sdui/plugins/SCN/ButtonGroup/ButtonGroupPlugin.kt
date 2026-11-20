package com.nshiftui.poc.sdui.plugins.scn.buttongroup
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
import com.nshiftui.poc.ui.components.SCNButtonGroup

@kotlinx.serialization.Serializable
data class ButtonGroupMetadata(
    val titles: List<String>,
    val selection: String = "",
) : NShiftMetadata

@NShiftPlugin(
    name = "ButtonGroup",
    version = "1.0.0",
    metadata = ButtonGroupMetadata::class,
)
class ButtonGroupPlugin : NShiftPluginWithMetadata<ButtonGroupMetadata>(
    "ButtonGroup",
    "1.0.0",
    ButtonGroupMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNButtonGroup(
            titles = metadata.titles,
            onSelect = { title ->
                store(
                    metadata.copy(selection = title),
                    NShiftTrigger.onSelect,
                    scope,
                )
            },
        )
    }
}
