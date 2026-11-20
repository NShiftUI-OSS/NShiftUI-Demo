package com.nshiftui.poc.sdui.events.scn.navigateevent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.navigation.AppNavigator
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.NShiftTrigger
import com.nshiftui.resolveOrThrow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@kotlinx.serialization.Serializable
data class NavigateEventMetadata(
    val screenName: String? = null,
) : NShiftMetadata

@NShiftEvent(
    name = "NavigateEvent",
    version = "1.0.0",
    metadata = NavigateEventMetadata::class,
)
class NavigateEvent : NShiftEventWithMetadata<NavigateEventMetadata>(
    "NavigateEvent",
    "1.0.0",
    NavigateEventMetadata::class,
) {
    override suspend fun execute() {
        val navigator = resolver.resolveOrThrow<AppNavigator>()
        val screenName = metadata.screenName?.takeIf { it.isNotBlank() } ?: return
        withContext(Dispatchers.Main) {
            navigator.pushScreen(screenName)
        }
        dispatch(this, NShiftTrigger.onComplete)
    }
}

@kotlinx.serialization.Serializable
data class AsyncNavigateEventMetadata(
    val screenName: String? = null,
) : NShiftMetadata

@NShiftEvent(
    name = "AsyncNavigateEvent",
    version = "1.0.0",
    metadata = AsyncNavigateEventMetadata::class,
)
class AsyncNavigateEvent : NShiftEventWithMetadata<AsyncNavigateEventMetadata>(
    "AsyncNavigateEvent",
    "1.0.0",
    AsyncNavigateEventMetadata::class,
) {
    override suspend fun execute() {
        val navigator = resolver.resolveOrThrow<AppNavigator>()
        val screenName = metadata.screenName?.takeIf { it.isNotBlank() } ?: return
        if (navigator.pushAsync(screenName)) {
            dispatch(this, NShiftTrigger.onComplete)
        }
    }
}
