package com.nshiftui.poc.sdui.plugins.scn.button
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNButton
import com.nshiftui.poc.ui.components.SCNButtonSize
import com.nshiftui.poc.ui.components.SCNButtonVariant

@kotlinx.serialization.Serializable
data class ButtonMetadata(
    val title: String,
    val icon: String?,
    val variant: String,
    val size: String,
    val isEnabled: Boolean,
) : NShiftMetadata {
    fun scnVariant(): SCNButtonVariant = when (variant) {
        "outline" -> SCNButtonVariant.Outline
        "secondary" -> SCNButtonVariant.Secondary
        "ghost" -> SCNButtonVariant.Ghost
        "destructive" -> SCNButtonVariant.Destructive
        "link" -> SCNButtonVariant.Link
        else -> SCNButtonVariant.Default
    }

    fun scnSize(): SCNButtonSize = when (size) {
        "xs", "iconXs" -> SCNButtonSize.Xs
        "sm", "iconSm" -> SCNButtonSize.Sm
        "lg", "iconLg" -> SCNButtonSize.Lg
        else -> SCNButtonSize.Default
    }
}

@NShiftPlugin(
    name = "Button",
    version = "1.0.0",
    metadata = ButtonMetadata::class,
)
class ButtonPlugin : NShiftPluginWithMetadata<ButtonMetadata>(
    "Button",
    "1.0.0",
    ButtonMetadata::class,
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        val frame = model.style.frame
        var modifier: Modifier = Modifier
        if (frame.hasFixedWidth) modifier = modifier.fillMaxWidth()
        if (frame.hasFixedHeight) modifier = modifier.fillMaxHeight()
        SCNButton(
            title = metadata.title,
            icon = metadata.icon,
            variant = metadata.scnVariant(),
            size = metadata.scnSize(),
            enabled = metadata.isEnabled,
            modifier = modifier,
            onClick = { fire(NShiftTrigger.onTap, scope) },
        )
    }
}
