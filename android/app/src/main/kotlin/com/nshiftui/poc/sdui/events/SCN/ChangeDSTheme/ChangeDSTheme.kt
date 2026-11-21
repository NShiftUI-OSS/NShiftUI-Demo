package com.nshiftui.poc.sdui.events.scn.changedstheme

import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.plugins.scn.select.SelectMetadata
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.theme.SCNAppTheme
import com.nshiftui.poc.theme.SCNThemeId
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@kotlinx.serialization.Serializable
data class ChangeDSThemeMetadata(
    val theme: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "ChangeDSTheme",
    version = "1.0.0",
    metadata = ChangeDSThemeMetadata::class,
)
class ChangeDSTheme : NShiftEventWithMetadata<ChangeDSThemeMetadata>(
    "ChangeDSTheme",
    "1.0.0",
    ChangeDSThemeMetadata::class,
) {
    override suspend fun execute() {
        val applied = withContext(Dispatchers.Main) {
            SCNAppTheme.change(chosenTheme())
        }
        if (!applied) return
        dispatch(this, NShiftTrigger.onComplete)
    }

    private fun chosenTheme(): String {
        if (SCNThemeId.resolve(metadata.theme) != null) return metadata.theme
        selectSelection()?.let { return it }
        val inputs = (viewModel as? ScreenViewModel)?.inputs?.value.orEmpty().map { it.value }
        return inputs.asReversed().firstOrNull { SCNThemeId.resolve(it) != null } ?: metadata.theme
    }

    private fun selectSelection(): String? =
        runCatching { themeSelection(tree().root) }.getOrNull()

    private fun themeSelection(node: NShiftPluginNode): String? {
        val selection = node.model.metadata?.unwrap(SelectMetadata::class.java)?.selection
        if (node.model.name.rawValue == "Select" && SCNThemeId.resolve(selection.orEmpty()) != null) {
            return selection
        }
        node.children.forEach { child -> themeSelection(child)?.let { return it } }
        node.slotChildren.values.flatten().forEach { child -> themeSelection(child)?.let { return it } }
        return null
    }
}
