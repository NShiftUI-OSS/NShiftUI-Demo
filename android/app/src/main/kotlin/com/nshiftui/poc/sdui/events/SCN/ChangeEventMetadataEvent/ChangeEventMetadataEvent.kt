package com.nshiftui.poc.sdui.events.scn.changeeventmetadataevent

import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.findEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.isOutcomeTrigger
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.resolveOrThrow

@kotlinx.serialization.Serializable
data class ChangeEventMetadataEventMetadata(
    val eventID: String = "",
) : NShiftMetadata

@NShiftEvent(
    name = "ChangeEventMetadataEvent",
    version = "1.0.0",
    metadata = ChangeEventMetadataEventMetadata::class,
)
class ChangeEventMetadataEvent : NShiftEventWithMetadata<ChangeEventMetadataEventMetadata>(
    "ChangeEventMetadataEvent",
    "1.0.0",
    ChangeEventMetadataEventMetadata::class,
) {
    override suspend fun execute() {
        val source = model.events.firstOrNull { isOutcomeTrigger(it.trigger).not() } ?: return
        val existing = findEvent(metadata.eventID, tree().root) ?: return
        if (source.name != existing.name) return
        val engine = resolver.resolveOrThrow<NShiftEngine>()
        engine.replaceEvent(
            metadata.eventID,
            existing.copy(metadata = source.metadata),
        )
        dispatch(this, NShiftTrigger.onComplete)
    }
}
