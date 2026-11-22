package com.nshiftui.poc.sdui.events.scn.changetabevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.onComplete

@kotlinx.serialization.Serializable
data class ChangeTabEventMetadata(
    val index: Int = 0,
) : NShiftMetadata

/** `ChangeTabEvent(index:)`: selects a tab of the screen's TabBar instead of pushing a screen. */
@NShiftEvent(
    name = "ChangeTabEvent",
    version = "1.0.0",
    metadata = ChangeTabEventMetadata::class,
)
class ChangeTabEvent : NShiftEventWithMetadata<ChangeTabEventMetadata>(
    "ChangeTabEvent",
    "1.0.0",
    ChangeTabEventMetadata::class,
) {
    override suspend fun execute() {
        val screen = viewModel as? ScreenViewModel ?: return
        if (metadata.index < 0) return
        screen.selectedTab.value = metadata.index
        dispatch(this, NShiftTrigger.onComplete)
    }
}
