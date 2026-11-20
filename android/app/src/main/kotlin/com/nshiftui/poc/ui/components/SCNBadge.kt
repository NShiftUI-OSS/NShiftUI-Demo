package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNSpace

enum class SCNBadgeVariant { Default, Secondary, Destructive, Outline, Ghost, Link }

@Composable
fun SCNBadge(text: String, variant: SCNBadgeVariant = SCNBadgeVariant.Default) {
    val background = when (variant) {
        SCNBadgeVariant.Default -> colors.primary
        SCNBadgeVariant.Secondary -> colors.secondary
        SCNBadgeVariant.Destructive -> if (theme.dark) colors.destructive.copy(alpha = 0.6f) else colors.destructive
        else -> Color.Transparent
    }
    val color = when (variant) {
        SCNBadgeVariant.Default -> SCNTextColor.PrimaryForeground
        SCNBadgeVariant.Secondary -> SCNTextColor.SecondaryForeground
        SCNBadgeVariant.Destructive -> SCNTextColor.White
        SCNBadgeVariant.Link -> SCNTextColor.Primary
        else -> SCNTextColor.Foreground
    }
    val shape = CircleShape
    SCNText(text, style = SCNTextStyle.Xs, weight = FontWeight.Medium, color = color, modifier = Modifier
        .clip(shape)
        .background(background)
        .border(if (variant == SCNBadgeVariant.Outline) 1.dp else 0.dp, if (variant == SCNBadgeVariant.Outline) colors.border else Color.Transparent, shape)
        .padding(horizontal = SCNSpace.s2, vertical = SCNSpace.s0_5))
}
