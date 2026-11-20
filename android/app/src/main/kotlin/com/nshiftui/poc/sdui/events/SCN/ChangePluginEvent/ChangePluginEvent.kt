package com.nshiftui.poc.sdui.events.scn.changepluginevent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.events.scn.eventdispatch.tree
import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftSlotKey
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.NShiftTrigger
import com.nshiftui.resolveOrThrow

@kotlinx.serialization.Serializable
data class ChangePluginEventMetadata(
    val pluginID: String = "",
) : NShiftMetadata

enum class ChangePluginEventSlot(override val rawValue: String) : NShiftSlotKey {
    Replacement("replacement"),
}

@NShiftEvent(
    name = "ChangePluginEvent",
    version = "1.0.0",
    metadata = ChangePluginEventMetadata::class,
    slots = ChangePluginEventSlot::class,
)
class ChangePluginEvent : NShiftEventWithMetadata<ChangePluginEventMetadata>(
    "ChangePluginEvent",
    "1.0.0",
    ChangePluginEventMetadata::class,
) {
    override suspend fun execute() {
        val replacement = model.slots[ChangePluginEventSlot.Replacement.slotName]?.firstOrNull() ?: return
        val engine = resolver.resolveOrThrow<NShiftEngine>()
        engine.replacePlugin(metadata.pluginID, replacement)
        dispatch(this, NShiftTrigger.onComplete)
    }
}
