package com.nshiftui.poc.sdui.events.scn.closebottomsheetevent

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
data class CloseBottomSheetEventMetadata(
    val sheetID: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "CloseBottomSheetEvent",
    version = "1.0.0",
    metadata = CloseBottomSheetEventMetadata::class,
)
class CloseBottomSheetEvent : NShiftEventWithMetadata<CloseBottomSheetEventMetadata>(
    "CloseBottomSheetEvent",
    "1.0.0",
    CloseBottomSheetEventMetadata::class,
) {
    override suspend fun execute() {
        val screen = viewModel as? ScreenViewModel ?: return
        val closed = withContext(Dispatchers.Main) {
            screen.closeSheet(metadata.sheetID)
        }
        if (!closed) return
        dispatch(this, NShiftTrigger.onComplete)
    }
}
