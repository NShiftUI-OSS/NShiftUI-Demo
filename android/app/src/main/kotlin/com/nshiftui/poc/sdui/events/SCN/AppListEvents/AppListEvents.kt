package com.nshiftui.poc.sdui.events.scn.applistevents

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.plugins.scn.screen.AppLists
import com.nshiftui.poc.sdui.triggers.onComplete
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

@kotlinx.serialization.Serializable
data class AddListItemEventMetadata(
    val listID: String = "",
    val item: Map<String, String> = emptyMap(),
) : NShiftMetadata

/** `AddListItemEvent(listID:, item: (key: "value", ...))`: appends to an app-scoped list. */
@NShiftEvent(
    name = "AddListItemEvent",
    version = "1.0.0",
    metadata = AddListItemEventMetadata::class,
)
class AddListItemEvent : NShiftEventWithMetadata<AddListItemEventMetadata>(
    "AddListItemEvent",
    "1.0.0",
    AddListItemEventMetadata::class,
) {
    override suspend fun execute() {
        if (metadata.listID.isBlank()) return
        AppLists.add(metadata.listID, JsonObject(metadata.item.mapValues { JsonPrimitive(it.value) }))
        dispatch(this, NShiftTrigger.onComplete)
    }
}

@kotlinx.serialization.Serializable
data class ClearListEventMetadata(
    val listID: String = "",
) : NShiftMetadata

/** `ClearListEvent(listID:)`: removes every item of an app-scoped list. */
@NShiftEvent(
    name = "ClearListEvent",
    version = "1.0.0",
    metadata = ClearListEventMetadata::class,
)
class ClearListEvent : NShiftEventWithMetadata<ClearListEventMetadata>(
    "ClearListEvent",
    "1.0.0",
    ClearListEventMetadata::class,
) {
    override suspend fun execute() {
        if (metadata.listID.isBlank()) return
        AppLists.clear(metadata.listID)
        dispatch(this, NShiftTrigger.onComplete)
    }
}
