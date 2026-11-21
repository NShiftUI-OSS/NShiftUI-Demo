package com.nshiftui.poc.sdui.plugins.scn.select
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.store
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNAppTheme
import com.nshiftui.poc.theme.SCNTheme
import com.nshiftui.poc.theme.SCNThemeId
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
        val scope = rememberCoroutineScope()
        val shown = themeSelection(metadata.options, LocalSCNTheme.current) ?: metadata.selection
        SCNSelect(
            options = metadata.options,
            selection = shown,
            onSelect = { value ->
                if (metadata.options.all { SCNThemeId.resolve(it) != null }) {
                    SCNAppTheme.change(value)
                }
                val id = model.id ?: renderID.rawValue
                optionalViewModel<ScreenViewModel>()?.registerInput(id, value)
                store(metadata.copy(selection = value), NShiftTrigger.onSelect, scope)
            },
        )
    }
}

private fun themeSelection(options: List<String>, theme: SCNTheme): String? {
    if (options.isEmpty() || options.any { SCNThemeId.resolve(it) == null }) return null
    val current = theme.preset.id
    return options.firstOrNull {
        it.equals(current.title, ignoreCase = true) || it.equals(current.name, ignoreCase = true)
    }
}
