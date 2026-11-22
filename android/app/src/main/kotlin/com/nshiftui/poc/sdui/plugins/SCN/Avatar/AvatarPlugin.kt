package com.nshiftui.poc.sdui.plugins.scn.avatar
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNAvatar
import com.nshiftui.poc.ui.components.SCNAvatarSize

@kotlinx.serialization.Serializable
data class AvatarMetadata(
    val initials: String,
    val size: String,
    val imageURL: String = "",
) : NShiftMetadata {
    fun scnSize(): SCNAvatarSize = when (size) {
        "sm" -> SCNAvatarSize.Sm
        "lg" -> SCNAvatarSize.Lg
        "xl" -> SCNAvatarSize.Xl
        else -> SCNAvatarSize.Default
    }
}

@NShiftPlugin(
    name = "Avatar",
    version = "1.0.0",
    metadata = AvatarMetadata::class,
)
class AvatarPlugin : NShiftPluginWithMetadata<AvatarMetadata>(
    "Avatar",
    "1.0.0",
    AvatarMetadata::class,
) {
    @Composable
    override fun Content() {
        SCNAvatar(
            initials = metadata.initials,
            size = metadata.scnSize(),
            imageURL = metadata.imageURL,
        )
    }
}
