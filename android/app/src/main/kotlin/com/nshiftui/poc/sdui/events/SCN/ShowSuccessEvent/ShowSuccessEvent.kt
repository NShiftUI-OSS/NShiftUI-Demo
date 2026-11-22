package com.nshiftui.poc.sdui.events.scn.showsuccessevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.ui.components.SuccessOverlay

@kotlinx.serialization.Serializable
data class ShowSuccessEventMetadata(
    val title: String = "",
    val message: String = "",
) : NShiftMetadata

/**
 * `ShowSuccessEvent(title:, message:)`: shows an animated success check over every
 * screen and finishes when it is gone, so the next events of the trigger run after it.
 */
@NShiftEvent(
    name = "ShowSuccessEvent",
    version = "1.0.0",
    metadata = ShowSuccessEventMetadata::class,
)
class ShowSuccessEvent : NShiftEventWithMetadata<ShowSuccessEventMetadata>(
    "ShowSuccessEvent",
    "1.0.0",
    ShowSuccessEventMetadata::class,
) {
    override suspend fun execute() {
        SuccessOverlay.show(metadata.title, metadata.message)
        dispatch(this, NShiftTrigger.onComplete)
    }
}
