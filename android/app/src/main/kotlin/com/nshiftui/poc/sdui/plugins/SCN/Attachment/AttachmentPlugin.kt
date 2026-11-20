package com.nshiftui.poc.sdui.plugins.scn.attachment
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNAttachment
import com.nshiftui.poc.ui.components.SCNAttachmentOrientation
import com.nshiftui.poc.ui.components.SCNAttachmentSize
import com.nshiftui.poc.ui.components.SCNAttachmentState

@kotlinx.serialization.Serializable
data class AttachmentMetadata(
    val title: String,
    val detail: String?,
    val state: String,
    val size: String,
    val orientation: String,
) : NShiftMetadata {
    fun scnState(): SCNAttachmentState = when (state) {
        "idle" -> SCNAttachmentState.Idle
        "uploading" -> SCNAttachmentState.Uploading
        "processing" -> SCNAttachmentState.Processing
        "error" -> SCNAttachmentState.Error
        else -> SCNAttachmentState.Done
    }

    fun scnSize(): SCNAttachmentSize = when (size) {
        "xs" -> SCNAttachmentSize.Xs
        "sm" -> SCNAttachmentSize.Sm
        else -> SCNAttachmentSize.Default
    }

    fun scnOrientation(): SCNAttachmentOrientation =
        if (orientation == "vertical") SCNAttachmentOrientation.Vertical else SCNAttachmentOrientation.Horizontal
}

@NShiftPlugin(
    name = "Attachment",
    version = "1.0.0",
    metadata = AttachmentMetadata::class,
)
class AttachmentPlugin : NShiftPluginWithMetadata<AttachmentMetadata>(
    "Attachment",
    "1.0.0",
    AttachmentMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNAttachment(
            title = metadata.title,
            detail = metadata.detail,
            state = metadata.scnState(),
            size = metadata.scnSize(),
            orientation = metadata.scnOrientation(),
        )
    }
}
