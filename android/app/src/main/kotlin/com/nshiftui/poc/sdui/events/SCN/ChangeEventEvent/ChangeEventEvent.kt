package com.nshiftui.poc.sdui.events.scn.changeeventevent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.isOutcomeTrigger
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.NShiftTrigger
import com.nshiftui.resolveOrThrow

@kotlinx.serialization.Serializable
data class ChangeEventEventMetadata(
    val eventID: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "ChangeEventEvent",
    version = "1.0.0",
    metadata = ChangeEventEventMetadata::class,
)
class ChangeEventEvent : NShiftEventWithMetadata<ChangeEventEventMetadata>(
    "ChangeEventEvent",
    "1.0.0",
    ChangeEventEventMetadata::class,
) {
    override suspend fun execute() {
        val replacement = model.events.firstOrNull { isOutcomeTrigger(it.trigger).not() } ?: return
        val engine = resolver.resolveOrThrow<NShiftEngine>()
        engine.replaceEvent(metadata.eventID, replacement)
        dispatch(this, NShiftTrigger.onComplete)
    }
}
