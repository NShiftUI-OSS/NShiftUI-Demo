package com.nshiftui.poc.sdui.events.scn.showtoastevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.ui.components.SCNToastVariant
import com.nshiftui.poc.ui.components.ToastMessage
import com.nshiftui.poc.ui.components.ToastOverlay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@kotlinx.serialization.Serializable
data class ShowToastEventMetadata(
    val title: String = "",
    val message: String = "",
    val icon: String = "",
    /** `default`, `success`, `error`, `info` or `warning`. */
    val variant: String = "default",
    /** Seconds on screen. */
    val duration: Double = 0.0,
) : NShiftMetadata

/** `ShowToastEvent(title:, message:, icon:, duration:)`: shows the toast at the top without blocking. */
@NShiftEvent(
    name = "ShowToastEvent",
    version = "1.0.0",
    metadata = ShowToastEventMetadata::class,
)
class ShowToastEvent : NShiftEventWithMetadata<ShowToastEventMetadata>(
    "ShowToastEvent",
    "1.0.0",
    ShowToastEventMetadata::class,
) {
    override suspend fun execute() {
        val duration = if (metadata.duration > 0) metadata.duration else 2.5
        withContext(Dispatchers.Main) {
            ToastOverlay.show(ToastMessage(
                    metadata.title,
                    metadata.message,
                    metadata.icon,
                    SCNToastVariant.from(metadata.variant),
                ), duration)
        }
        dispatch(this, NShiftTrigger.onComplete)
    }
}
