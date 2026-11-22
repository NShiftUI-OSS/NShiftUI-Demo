package com.nshiftui.poc.sdui.events.scn.closeappevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.navigation.AppCloser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@kotlinx.serialization.Serializable
class CloseAppEventMetadata : NShiftMetadata

/** `CloseAppEvent()`: finishes the app task and removes it from recents. */
@NShiftEvent(
    name = "CloseAppEvent",
    version = "1.0.0",
    metadata = CloseAppEventMetadata::class,
)
class CloseAppEvent : NShiftEventWithMetadata<CloseAppEventMetadata>(
    "CloseAppEvent",
    "1.0.0",
    CloseAppEventMetadata::class,
) {
    override suspend fun execute() {
        withContext(Dispatchers.Main) { AppCloser.close() }
    }
}
