package com.nshiftui.poc.sdui.events.scn.updatelistevent

import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onFailure
import com.nshiftui.resolveOrThrow

/**
 * Loads JSON into the list [listID], rendered by the `ForEach(source:)` bound
 * to it. [url] accepts `{{route.x}}` / `{{input.x}}`. Pagination: follow the
 * URL at [nextPath], or send [offsetParameter]/[limitParameter] with [pageSize]
 * (ending at [totalPath]). [expandPath] replaces each item with the object at
 * that URL field. [mode]: "append" (next page) or "replace" (reload).
 */
@kotlinx.serialization.Serializable
data class UpdateListEventMetadata(
    val listID: String = "",
    val url: String = "",
    val headers: Map<String, String> = emptyMap(),
    val itemsPath: String = "",
    val mode: String = "append",
    val pageSize: Int = 0,
    val offsetParameter: String = "offset",
    val limitParameter: String = "limit",
    val nextPath: String = "",
    val totalPath: String = "",
    val expandPath: String = "",
    val maxPages: Int = 1,
) : NShiftMetadata

@NShiftEvent(
    name = "UpdateListEvent",
    version = "1.0.0",
    metadata = UpdateListEventMetadata::class,
)
class UpdateListEvent : NShiftEventWithMetadata<UpdateListEventMetadata>(
    "UpdateListEvent",
    "1.0.0",
    UpdateListEventMetadata::class,
) {
    override suspend fun execute() {
        val screen = viewModel as? ScreenViewModel
        val tree = (screen?.renderingEngine ?: resolver.resolveOrThrow<NShiftEngine>()) as? NShiftEngineTree
        if (screen == null || tree == null) {
            dispatch(this, NShiftTrigger.onFailure)
            return
        }
        val response = try {
            screen.lists.update(metadata, tree, screen)
        } catch (_: Exception) {
            dispatch(this, NShiftTrigger.onFailure)
            return
        }
        if (response.status in 200..299) dispatch(this, NShiftTrigger.onComplete)
    }
}
