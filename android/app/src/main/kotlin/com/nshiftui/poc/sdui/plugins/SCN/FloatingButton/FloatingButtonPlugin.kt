package com.nshiftui.poc.sdui.plugins.scn.floatingbutton

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugins.scn.screen.AppLists
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNFloatingButton

@kotlinx.serialization.Serializable
data class FloatingButtonMetadata(
    val icon: String = "plus",
    /** Fixed badge text; empty hides it. */
    val badge: String = "",
    /** App-scoped list whose item count is the badge; zero hides it. */
    val badgeList: String = "",
) : NShiftMetadata

/** `FloatingButton(icon:, badgeList:)`: round button placed by the screen's FloatingButton slot. */
@NShiftPlugin(
    name = "FloatingButton",
    version = "1.0.0",
    metadata = FloatingButtonMetadata::class,
)
class FloatingButtonPlugin : NShiftPluginWithMetadata<FloatingButtonMetadata>(
    "FloatingButton",
    "1.0.0",
    FloatingButtonMetadata::class,
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        val lists by AppLists.lists.collectAsState()
        val badge = if (metadata.badgeList.isNotEmpty()) {
            val count = lists[metadata.badgeList]?.size ?: 0
            when {
                count <= 0 -> null
                count > 99 -> "99+"
                else -> count.toString()
            }
        } else {
            metadata.badge.ifEmpty { null }
        }
        SCNFloatingButton(icon = metadata.icon, badge = badge) {
            fire(NShiftTrigger.onTap, scope)
        }
    }
}
