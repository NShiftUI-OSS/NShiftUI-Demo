package com.nshiftui.poc.sdui.plugins.scn.alert
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNAlert
import com.nshiftui.poc.ui.components.SCNAlertVariant

@kotlinx.serialization.Serializable
data class AlertMetadata(
    val title: String,
    val message: String,
    val variant: String,
) : NShiftMetadata {
    fun scnVariant(): SCNAlertVariant =
        if (variant == "destructive") SCNAlertVariant.Destructive else SCNAlertVariant.Default
}

@NShiftPlugin(
    name = "Alert",
    version = "1.0.0",
    metadata = AlertMetadata::class,
)
class AlertPlugin : NShiftPluginWithMetadata<AlertMetadata>(
    "Alert",
    "1.0.0",
    AlertMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNAlert(
            title = metadata.title,
            message = metadata.message,
            variant = metadata.scnVariant(),
        )
    }
}
