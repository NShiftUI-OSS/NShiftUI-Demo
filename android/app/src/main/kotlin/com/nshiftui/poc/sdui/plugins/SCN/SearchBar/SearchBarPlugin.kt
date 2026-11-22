package com.nshiftui.poc.sdui.plugins.scn.searchbar

import androidx.compose.runtime.Composable
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
@NShiftPlugin(
    name = "SearchBar",
    version = "1.0.0",
    metadata = SearchBarMetadata::class,
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
    }
}
