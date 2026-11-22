package com.nshiftui.poc.sdui.plugins.scn.searchbar

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.layout
import androidx.compose.ui.unit.dp
import com.nshiftui.NShiftSlotKey
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onSubmit
import com.nshiftui.poc.ui.components.SCNSearchBar

@kotlinx.serialization.Serializable
data class SearchBarMetadata(
    val placeholder: String = "Buscar",
    val text: String = "",
) : NShiftMetadata

/**
 * `SearchBar(placeholder:)`: its text is a screen input (by its `.id`), so
 * templates (`{{input.id}}`) and `ForEach(searchInput:)` can read it. Fires
 * `OnChange` while typing and `OnSubmit` on search or clear.
 */
/** Plugins (usually `Badge`s) in a horizontal row under the field, scrollable when they overflow. */
enum class SearchBarSlot(override val rawValue: String) : NShiftSlotKey {
    Badges("badges"),
}

@NShiftPlugin(
    name = "SearchBar",
    version = "1.0.0",
    metadata = SearchBarMetadata::class,
    slots = SearchBarSlot::class,
)
class SearchBarPlugin : NShiftPluginWithMetadata<SearchBarMetadata>(
    "SearchBar",
    "1.0.0",
    SearchBarMetadata::class,
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        val screen = optionalViewModel<ScreenViewModel>()
        val id = model.id ?: renderID.rawValue
        // Starts from the screen input when it exists, so a retained screen
        // (tab switch, back navigation) keeps the current search.
        var text by rememberSaveable(id) {
            mutableStateOf(screen?.inputs?.value?.firstOrNull { it.id == id }?.value ?: metadata.text)
        }
        LaunchedEffect(id) { screen?.registerInput(id, text) }
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SCNSearchBar(
                value = text,
                onValueChange = { value ->
                    text = value
                    screen?.registerInput(id, value)
                    fire(NShiftTrigger.onChange, scope)
                },
                placeholder = metadata.placeholder,
                onSubmit = { fire(NShiftTrigger.onSubmit, scope) },
            )
            if (model.slots[SearchBarSlot.Badges.slotName].orEmpty().isNotEmpty()) {
                // Full-bleed row: badges slide edge to edge past the 16 dp gutter.
                Row(
                    modifier = Modifier
                        .layout { measurable, constraints ->
                            val extra = 32.dp.roundToPx()
                            val placeable = measurable.measure(
                                constraints.copy(maxWidth = constraints.maxWidth + extra, minWidth = constraints.minWidth + extra),
                            )
                            layout(constraints.maxWidth, placeable.height) { placeable.place(-extra / 2, 0) }
                        }
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    slots(SearchBarSlot.Badges)
                }
            }
        }
    }
}
