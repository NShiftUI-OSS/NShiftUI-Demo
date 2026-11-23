package com.nshiftui.poc.sdui.plugins.scn.screen

import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

/**
 * App-scoped lists shared by every screen (for example a cart). Items are added
 * with `AddListItemEvent` and removed with `ClearListEvent`; any `ForEach(source:)`
 * bound to the list id renders them, and a `FloatingButton(badgeList:)` shows how
 * many there are. Nothing here knows what the items are.
 */
object AppLists {
    private val state = MutableStateFlow<Map<String, List<JsonElement>>>(emptyMap())
    val lists: StateFlow<Map<String, List<JsonElement>>> = state.asStateFlow()

    fun add(listID: String, item: JsonObject) {
        val entry = JsonObject(item + ("listEntryID" to JsonPrimitive(UUID.randomUUID().toString())))
        state.update { it + (listID to (it[listID].orEmpty() + entry)) }
    }

    fun remove(listID: String, entryID: String): Boolean {
        while (true) {
            val previous = state.value
            val items = previous[listID] ?: return false
            val next = items.filterNot { item ->
                ((item as? JsonObject)?.get("listEntryID") as? JsonPrimitive)?.contentOrNull == entryID
            }
            if (next.size == items.size) return false
            if (state.compareAndSet(previous, previous + (listID to next))) return true
        }
    }

    fun clear(listID: String) {
        state.update { it + (listID to emptyList()) }
    }
}
