package com.nshiftui.poc.sdui.plugins.scn.text
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNText
import com.nshiftui.poc.ui.components.SCNTextColor
import com.nshiftui.poc.ui.components.SCNTextStyle
import androidx.compose.ui.text.font.FontWeight

@kotlinx.serialization.Serializable
data class TextMetadata(
    val text: String = "",
    val style: String = "sm",
    val weight: String = "regular",
    val color: String = "foreground",
) : NShiftMetadata {
    fun scnStyle(): SCNTextStyle = when (style) {
        "xs" -> SCNTextStyle.Xs
        "base" -> SCNTextStyle.Base
        "lg" -> SCNTextStyle.Lg
        "xl" -> SCNTextStyle.Xl
        "xl2" -> SCNTextStyle.Xl2
        else -> SCNTextStyle.Sm
    }

    fun scnWeight(): FontWeight = when (weight) {
        "medium" -> FontWeight.Medium
        "semibold" -> FontWeight.SemiBold
        else -> FontWeight.Normal
    }

    fun scnColor(): SCNTextColor = when (color) {
        "mutedForeground" -> SCNTextColor.Muted
        "primary" -> SCNTextColor.Primary
        "primaryForeground" -> SCNTextColor.PrimaryForeground
        "secondaryForeground" -> SCNTextColor.SecondaryForeground
        "accentForeground" -> SCNTextColor.AccentForeground
        "destructive" -> SCNTextColor.Destructive
        "white" -> SCNTextColor.White
        else -> SCNTextColor.Foreground
    }
}

@NShiftPlugin(
    name = "Text",
    version = "1.0.0",
    metadata = TextMetadata::class,
)
class TextPlugin : NShiftPluginWithMetadata<TextMetadata>(
    "Text",
    "1.0.0",
    TextMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNText(
            text = metadata.text,
            style = metadata.scnStyle(),
            weight = metadata.scnWeight(),
            color = metadata.scnColor(),
        )
    }
}
