package com.nshiftui.poc.sdui.plugins.scn.progress
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNProgress

@kotlinx.serialization.Serializable
data class ProgressMetadata(
    val value: Float,
) : NShiftMetadata

@NShiftPlugin(
    name = "Progress",
    version = "1.0.0",
    metadata = ProgressMetadata::class,
)
class ProgressPlugin : NShiftPluginWithMetadata<ProgressMetadata>(
    "Progress",
    "1.0.0",
    ProgressMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNProgress(value = metadata.value)
    }
}
