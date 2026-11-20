package com.nshiftui.poc.sdui.plugins.scn.sheet

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onPresent
import com.nshiftui.poc.ui.components.SCNSheet

@kotlinx.serialization.Serializable
data class SheetMetadata(
    val title: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "Sheet",
    version = "1.0.0",
    metadata = SheetMetadata::class,
)
class SheetPlugin : NShiftPluginWithMetadata<SheetMetadata>(
    "Sheet",
    "1.0.0",
    SheetMetadata::class,
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        val screen = optionalViewModel<ScreenViewModel>() ?: return
        var presented by remember { mutableStateOf(false) }
        val ids = listOfNotNull(model.id, renderID.rawValue).distinct()
        val sheets by screen.bottomSheets.collectAsState()
        DisposableEffect(ids) {
            ids.forEach { screen.registerSheet(it) }
            onDispose { ids.forEach { screen.unregisterSheet(it) } }
        }
        val open = sheets.any { sheet -> ids.contains(sheet.id) && sheet.presented }
        SideEffect { presented = open }
        SCNSheet(
            presented = presented,
            onPresented = {
                fire(NShiftTrigger.onPresent, scope)
                screen.didPresent(ids)
            },
            onDismiss = {
                presented = false
                fire(NShiftTrigger.onDismiss, scope)
                screen.didDismiss(ids)
            },
            title = metadata.title,
        ) {
            children()
        }
    }
}
