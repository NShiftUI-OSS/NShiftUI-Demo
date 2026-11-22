package com.nshiftui.poc.sdui.plugins.scn.badge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import com.nshiftui.poc.theme.LocalSCNTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNBadge
import com.nshiftui.poc.ui.components.SCNBadgeVariant

@kotlinx.serialization.Serializable
data class BadgeMetadata(
    val text: String,
    val variant: String = "default",
    /** Optional selection: tapping writes [value] to the screen input [input]. */
    val input: String = "",
    val value: String? = null,
    val selectedVariant: String = "default",
) : NShiftMetadata {
    val selectionValue: String get() = value ?: text

    fun scnVariant(selected: Boolean = false): SCNBadgeVariant = when (if (selected) selectedVariant else variant) {
        "secondary" -> SCNBadgeVariant.Secondary
        "destructive" -> SCNBadgeVariant.Destructive
        "outline" -> SCNBadgeVariant.Outline
        "ghost" -> SCNBadgeVariant.Ghost
        "link" -> SCNBadgeVariant.Link
        else -> SCNBadgeVariant.Default
    }
}

@NShiftPlugin(
    name = "Badge",
    version = "1.0.0",
    metadata = BadgeMetadata::class,
)
class BadgePlugin : NShiftPluginWithMetadata<BadgeMetadata>(
    "Badge",
    "1.0.0",
    BadgeMetadata::class,
) {
    @Composable
    override fun Content() {
        val screen = optionalViewModel<ScreenViewModel>()
        if (metadata.input.isEmpty() || screen == null) {
            SCNBadge(text = metadata.text, variant = metadata.scnVariant())
            return
        }
        // Bound to a screen input: shows its selected variant while the input
        // holds its value, and selects it on tap.
        val scope = rememberCoroutineScope()
        val inputs by screen.inputs.collectAsState()
        val current = inputs.firstOrNull { it.id == metadata.input }?.value.orEmpty()
        val selected = current == metadata.selectionValue
        Box(
            // Opaque base clipped to the badge, so content scrolling under a floating
            // row never shows through translucent variants.
            Modifier
                .clip(CircleShape)
                .background(LocalSCNTheme.current.palette.background)
                .clickable {
                screen.registerInput(metadata.input, metadata.selectionValue)
                fire(NShiftTrigger.onTap, scope)
            },
        ) {
            SCNBadge(text = metadata.text, variant = metadata.scnVariant(selected))
        }
    }
}
