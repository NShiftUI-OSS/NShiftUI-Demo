package com.nshiftui.poc.sdui.plugins.scn.skeleton
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.ui.components.SCNSkeleton
import androidx.compose.ui.unit.dp

@kotlinx.serialization.Serializable
data class SkeletonMetadata(
    val height: Float? = null,
) : NShiftMetadata

@NShiftPlugin(
    name = "Skeleton",
    version = "1.0.0",
    metadata = SkeletonMetadata::class,
)
class SkeletonPlugin : NShiftPluginWithMetadata<SkeletonMetadata>(
    "Skeleton",
    "1.0.0",
    SkeletonMetadata::class,
) {
    @Composable
    override fun Content() {
        val height = metadata.height
        if (height == null) {
            SCNSkeleton()
        } else {
            SCNSkeleton(height = height.dp)
        }
    }
}
