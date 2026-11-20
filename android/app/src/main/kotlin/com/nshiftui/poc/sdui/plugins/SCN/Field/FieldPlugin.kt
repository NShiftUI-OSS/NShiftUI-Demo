package com.nshiftui.poc.sdui.plugins.scn.field
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNField

@kotlinx.serialization.Serializable
data class FieldMetadata(
    val label: String,
    val hint: String? = null,
) : NShiftMetadata

@NShiftPlugin(
    name = "Field",
    version = "1.0.0",
    metadata = FieldMetadata::class,
)
class FieldPlugin : NShiftPluginWithMetadata<FieldMetadata>(
    "Field",
    "1.0.0",
    FieldMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNField(
            label = metadata.label,
            hint = metadata.hint,
        ) {
            children()
        }
    }
}
