package com.nshiftui.poc.sdui.events.scn.backnavigationevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.navigation.AppNavigator
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.resolveOrThrow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class BackNavigationEventMetadata(
    @SerialName("for") val steps: Int = 1,
    @SerialName("to") val destination: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "BackNavigationEvent",
    version = "1.0.0",
    metadata = BackNavigationEventMetadata::class,
)
class BackNavigationEvent : NShiftEventWithMetadata<BackNavigationEventMetadata>(
    "BackNavigationEvent",
    "1.0.0",
    BackNavigationEventMetadata::class,
) {
    override suspend fun execute() {
        val navigator = resolver.resolveOrThrow<AppNavigator>()
        val destination = metadata.destination.removePrefix(".")
        withContext(Dispatchers.Main) {
            // A modal screen closes first; the stack under it is untouched.
            if (navigator.dismissModal()) return@withContext
            when {
                destination == "root" -> navigator.popToRoot()
                destination.isNotBlank() -> navigator.popToScreen(destination)
                else -> navigator.pop(steps = metadata.steps)
            }
        }
        dispatch(this, NShiftTrigger.onComplete)
    }
}
