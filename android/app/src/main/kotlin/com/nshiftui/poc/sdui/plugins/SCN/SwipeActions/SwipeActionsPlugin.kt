package com.nshiftui.poc.sdui.plugins.scn.swipeactions

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPlugin as BasePlugin
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftSlotKey
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.ui.SCNIcon
import com.nshiftui.poc.ui.components.SCNText
import com.nshiftui.poc.ui.components.SCNTextColor
import com.nshiftui.poc.ui.components.SCNTextStyle
import kotlin.math.roundToInt
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

@Serializable
data class SwipeActionMetadata(
    val title: String,
    val icon: String? = null,
    val variant: String? = null,
) : NShiftMetadata

enum class SwipeActionsSlot(override val rawValue: String) : NShiftSlotKey {
    Leading("leading"),
    Trailing("trailing"),
}

@NShiftPlugin(name = "SwipeAction", version = "1.0.0", metadata = SwipeActionMetadata::class)
class SwipeActionPlugin : NShiftPluginWithMetadata<SwipeActionMetadata>(
    "SwipeAction", "1.0.0", SwipeActionMetadata::class,
) {
    @Composable
    override fun Content() = Unit
}

@NShiftPlugin(name = "SwipeActions", version = "1.0.0", slots = SwipeActionsSlot::class)
class SwipeActionsPlugin : BasePlugin("SwipeActions", "1.0.0") {
    @Composable
    override fun Content() {
        val tree = requireEngineTree()
        val node = tree.node(renderID)
        val leading = node?.actions(SwipeActionsSlot.Leading).orEmpty()
        val trailing = node?.actions(SwipeActionsSlot.Trailing).orEmpty()
        if (leading.isEmpty() && trailing.isEmpty()) {
            children()
            return
        }

        val scope = rememberCoroutineScope()
        val density = LocalDensity.current
        val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
        val colors = LocalSCNTheme.current.palette
        var offset by remember(model) { mutableFloatStateOf(0f) }
        val settle = remember(model) { Animatable(0f) }

        fun activate(action: Action) {
            scope.launch {
                settle.stop()
                offset = 0f
                tree.handle(NShiftTrigger.onTap, action.node.renderId.rawValue)
            }
        }

        BoxWithConstraints(Modifier.fillMaxWidth().clipToBounds()) {
            val leadingWidth = minOf(maxWidth, 88.dp * leading.size)
            val trailingWidth = minOf(maxWidth, 88.dp * trailing.size)
            val maxOffset = with(density) { leadingWidth.toPx() }
            val minOffset = -with(density) { trailingWidth.toPx() }
            val visible = offset.coerceIn(minOffset, maxOffset)
            Box(
                Modifier
                    .fillMaxWidth()
                    .draggable(
                        state = rememberDraggableState { delta ->
                            offset = (offset + delta).coerceIn(minOffset, maxOffset)
                        },
                        orientation = Orientation.Horizontal,
                        reverseDirection = rtl,
                        startDragImmediately = settle.isRunning,
                        onDragStarted = { settle.stop() },
                        onDragStopped = {
                            val target = when {
                                maxOffset > 0f && offset > maxOffset / 3 -> maxOffset
                                minOffset < 0f && offset < minOffset / 3 -> minOffset
                                else -> 0f
                            }
                            settle.snapTo(offset)
                            settle.animateTo(target) { offset = value }
                        },
                    )
                    .semantics {
                        customActions = (leading + trailing).map { action ->
                            CustomAccessibilityAction(action.metadata.title) {
                                activate(action)
                                true
                            }
                        }
                    },
            ) {
                Box(Modifier.matchParentSize()) {
                    val actions = if (visible > 0) leading else trailing.asReversed()
                    if (visible != 0f && actions.isNotEmpty()) {
                        Row(
                            Modifier
                                .align(if (visible > 0) Alignment.CenterStart else Alignment.CenterEnd)
                                .width(if (visible > 0) leadingWidth else trailingWidth)
                                .fillMaxHeight(),
                        ) {
                            actions.forEach { action ->
                                val destructive = action.metadata.variant == "destructive"
                                val background = if (destructive) colors.destructive else colors.primary
                                val foreground = if (destructive) Color.White else colors.primaryForeground
                                Column(
                                    Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                        .padding(horizontal = 4.dp, vertical = 3.dp)
                                        .clip(RoundedCornerShape(SCNRadius.xl))
                                        .background(background)
                                        .clickable(role = Role.Button) { activate(action) },
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center,
                                ) {
                                    action.metadata.icon?.takeIf(String::isNotBlank)?.let {
                                        SCNIcon(it, tint = foreground, size = 20.dp)
                                    }
                                    SCNText(action.metadata.title, color = if (destructive) SCNTextColor.White else SCNTextColor.PrimaryForeground, style = SCNTextStyle.Sm)
                                }
                            }
                        }
                    }
                }
                Box(
                    Modifier
                        .offset { IntOffset(visible.roundToInt(), 0) }
                        .fillMaxWidth()
                        .background(colors.background),
                ) {
                    children()
                }
            }
        }
    }

    private data class Action(val node: NShiftPluginNode, val metadata: SwipeActionMetadata)

    private fun NShiftPluginNode.actions(side: SwipeActionsSlot): List<Action> =
        slotChildren[side.slotName].orEmpty().mapNotNull { child ->
            if (child.model.name.rawValue != "SwipeAction") return@mapNotNull null
            child.model.metadata?.unwrap(SwipeActionMetadata::class.java)?.let { Action(child, it) }
        }
}
