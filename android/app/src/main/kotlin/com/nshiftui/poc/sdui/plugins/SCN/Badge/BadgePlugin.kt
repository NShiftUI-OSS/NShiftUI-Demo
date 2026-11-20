package com.nshiftui.poc.sdui.plugins.scn.badge
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNBadge
import com.nshiftui.poc.ui.components.SCNBadgeVariant

@kotlinx.serialization.Serializable
data class BadgeMetadata(
    val text: String,
    val variant: String,
) : NShiftMetadata {
    fun scnVariant(): SCNBadgeVariant = when (variant) {
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
        SCNBadge(
            text = metadata.text,
            variant = metadata.scnVariant(),
        )
    }
}
