package com.nshiftui.poc.sdui.events.scn.changepluginmetadataevent

import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftSlotKey
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.resolveOrThrow

@kotlinx.serialization.Serializable
data class ChangePluginMetadataEventMetadata(
    val pluginID: String = "",
) : NShiftMetadata

enum class ChangePluginMetadataEventSlot(override val rawValue: String) : NShiftSlotKey {
    Metadata("metadata"),
}

@NShiftEvent(
    name = "ChangePluginMetadataEvent",
    version = "1.0.0",
    metadata = ChangePluginMetadataEventMetadata::class,
    slots = ChangePluginMetadataEventSlot::class,
)
class ChangePluginMetadataEvent : NShiftEventWithMetadata<ChangePluginMetadataEventMetadata>(
    "ChangePluginMetadataEvent",
    "1.0.0",
    ChangePluginMetadataEventMetadata::class,
) {
    override suspend fun execute() {
        val source = model.slots[ChangePluginMetadataEventSlot.Metadata.slotName]?.firstOrNull() ?: return
        val node = tree().node(metadata.pluginID) ?: return
        if (source.name != node.model.name) return
        val engine = resolver.resolveOrThrow<NShiftEngine>()
        engine.replaceMetadata(metadata.pluginID, source.metadata)
        dispatch(this, NShiftTrigger.onComplete)
    }
}
