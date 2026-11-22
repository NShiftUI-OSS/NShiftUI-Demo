package com.nshiftui.poc.sdui.plugins.scn.screen

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.serialization.json.JsonElement

/**
 * App-scoped lists shared by every screen (for example a cart). Items are added
 * with `AddListItemEvent` and removed with `ClearListEvent`; any `ForEach(source:)`
 * bound to the list id renders them, and a `FloatingButton(badgeList:)` shows how
 * many there are. Nothing here knows what the items are.
 */
object AppLists {
    private val state = MutableStateFlow<Map<String, List<JsonElement>>>(emptyMap())
    val lists: StateFlow<Map<String, List<JsonElement>>> = state.asStateFlow()

    fun add(listID: String, item: JsonElement) {
        state.update { it + (listID to (it[listID].orEmpty() + item)) }
    }

    fun clear(listID: String) {
        state.update { it + (listID to emptyList()) }
    }
}
