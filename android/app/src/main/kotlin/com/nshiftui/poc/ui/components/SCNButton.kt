package com.nshiftui.poc.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

enum class SCNButtonVariant { Default, Outline, Secondary, Ghost, Destructive, Link }
enum class SCNButtonSize { Xs, Sm, Default, Lg }

@Composable
fun SCNButton(
    title: String = "",
    modifier: Modifier = Modifier,
    icon: String? = null,
    variant: SCNButtonVariant = SCNButtonVariant.Default,
    size: SCNButtonSize = SCNButtonSize.Default,
    enabled: Boolean = true,
    grouped: Boolean = false,
    onClick: () -> Unit,
) {
    val height = when (size) {
        SCNButtonSize.Xs -> SCNSpace.s6
        SCNButtonSize.Sm -> SCNSpace.s8
        SCNButtonSize.Default -> SCNSpace.s9
        SCNButtonSize.Lg -> SCNSpace.s10
    }
    val radius = if (grouped) 0.dp else SCNRadius.md
    val shape = RoundedCornerShape(radius)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val background by animateColorAsState(
        buttonBackground(variant, pressed && enabled),
        tween(150),
        label = "button-fill",
    )
    val alpha by animateFloatAsState(
        targetValue = when {
            !enabled -> SCNOpacity.disabled
            pressed -> SCNOpacity.pressed
            else -> SCNOpacity.opaque
        },
        animationSpec = tween(150),
        label = "button-press",
    )
    val label = when (variant) {
        SCNButtonVariant.Default -> SCNTextColor.PrimaryForeground
        SCNButtonVariant.Secondary -> SCNTextColor.SecondaryForeground
        SCNButtonVariant.Destructive -> SCNTextColor.White
        SCNButtonVariant.Link -> SCNTextColor.Primary
        else -> SCNTextColor.Foreground
    }
    val border = when {
        grouped -> Color.Transparent
        variant == SCNButtonVariant.Outline && theme.dark -> colors.input
        variant == SCNButtonVariant.Outline -> colors.border
        else -> Color.Transparent
    }
    val iconOnly = !icon.isNullOrEmpty() && title.isEmpty()
    val labelColor = ink(label)
    Box(
        modifier = Modifier
            .graphicsLayer { this.alpha = alpha }
            .then(modifier)
            .then(if (grouped) Modifier.fillMaxWidth().fillMaxHeight() else Modifier)
            .then(if (iconOnly) Modifier.size(height) else if (grouped) Modifier else Modifier.heightIn(min = height))
            .clip(shape)
            .background(background)
            .border(if (border == Color.Transparent) 0.dp else 1.dp, border, shape)
            .clickable(
                interactionSource = interaction,
                indication = null,
                enabled = enabled,
                onClick = onClick,
            )
            .padding(horizontal = if (iconOnly) 0.dp else SCNSpace.s3),
        contentAlignment = Alignment.Center,
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(SCNSpace.s2),
        ) {
            if (!icon.isNullOrEmpty()) {
                SCNIcon(icon, size = SCNSpace.s4, tint = labelColor)
            }
            if (title.isNotEmpty()) {
                SCNText(
                    title,
                    style = if (size == SCNButtonSize.Xs) SCNTextStyle.Xs else SCNTextStyle.Sm,
                    weight = FontWeight.Medium,
                    color = label,
                )
            }
        }
    }
}

@Composable
private fun buttonBackground(variant: SCNButtonVariant, pressed: Boolean): Color = when (variant) {
    SCNButtonVariant.Default -> colors.primary.copy(alpha = if (pressed) SCNOpacity.pressed else SCNOpacity.opaque)
    SCNButtonVariant.Outline -> when {
        theme.dark -> colors.input.copy(alpha = if (pressed) SCNOpacity.disabled else SCNOpacity.field)
        pressed -> colors.accent
        else -> colors.background
    }
    SCNButtonVariant.Secondary -> colors.secondary
    SCNButtonVariant.Ghost -> if (pressed) colors.accent else Color.Transparent
    SCNButtonVariant.Link -> Color.Transparent
    SCNButtonVariant.Destructive -> if (theme.dark) colors.destructive.copy(alpha = 0.6f) else colors.destructive
}
