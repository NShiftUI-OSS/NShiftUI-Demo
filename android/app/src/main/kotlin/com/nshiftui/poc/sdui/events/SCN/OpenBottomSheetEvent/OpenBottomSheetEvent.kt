package com.nshiftui.poc.sdui.events.scn.openbottomsheetevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.onComplete
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@kotlinx.serialization.Serializable
data class OpenBottomSheetEventMetadata(
    val sheetID: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "OpenBottomSheetEvent",
    version = "1.0.0",
    metadata = OpenBottomSheetEventMetadata::class,
)
class OpenBottomSheetEvent : NShiftEventWithMetadata<OpenBottomSheetEventMetadata>(
    "OpenBottomSheetEvent",
    "1.0.0",
    OpenBottomSheetEventMetadata::class,
) {
    override suspend fun execute() {
        val screen = viewModel as? ScreenViewModel ?: return
        val opened = withContext(Dispatchers.Main) {
            screen.openSheet(metadata.sheetID)
        }
        if (!opened) return
        dispatch(this, NShiftTrigger.onComplete)
    }
}
