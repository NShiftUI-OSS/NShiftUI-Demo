package com.nshiftui.poc.sdui.plugins.scn.card
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nshiftui.NShiftMetadata
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftPlugin
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin as NShiftPluginMacro
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNCard

@kotlinx.serialization.Serializable
data class CardMetadata(
    val filter: String = "",
) : NShiftMetadata

@NShiftPluginMacro(
    name = "Card",
    version = "1.0.0",
    metadata = CardMetadata::class,
)
class CardPlugin : NShiftPluginWithMetadata<CardMetadata>(
    "Card",
    "1.0.0",
    CardMetadata::class,
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        val screen = optionalViewModel<ScreenViewModel>()
        val inputs by (screen?.inputs ?: kotlinx.coroutines.flow.flowOf(emptyList())).collectAsState(emptyList())
        val selectedFilter = inputs.firstOrNull { it.id == "product-filter" }?.value ?: "Todos"
        val visible = metadata.filter.isBlank() ||
            selectedFilter.equals("Todos", ignoreCase = true) ||
            metadata.filter.equals(selectedFilter, ignoreCase = true)
        if (visible) {
            SCNCard(
                onClick = { fire(NShiftTrigger.onTap, scope) },
            ) {
                children()
            }
        } else {
            Spacer(Modifier.height(0.dp))
        }
    }
}
