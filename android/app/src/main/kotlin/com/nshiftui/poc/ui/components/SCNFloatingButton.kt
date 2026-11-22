package com.nshiftui.poc.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

/** Round floating action button with an icon and an optional top-right notification badge. */
@Composable
fun SCNFloatingButton(
    icon: String?,
    badge: String? = null,
    onClick: () -> Unit,
) {
    val colors = LocalSCNTheme.current.palette
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(if (pressed) 0.92f else 1f, tween(120), label = "fab-press")
    Box(Modifier.scale(scale)) {
        Box(
            Modifier
                .size(56.dp)
                .shadow(10.dp, CircleShape)
                .background(colors.primary, CircleShape)
                .clickable(interactionSource = interaction, indication = null, onClick = onClick),
            contentAlignment = Alignment.Center,
        ) {
            if (!icon.isNullOrEmpty()) {
                SCNIcon(icon, size = SCNSpace.s6, tint = colors.primaryForeground)
            }
        }
        AnimatedVisibility(
            visible = !badge.isNullOrEmpty(),
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 4.dp, y = (-4).dp),
            enter = scaleIn() + fadeIn(),
            exit = scaleOut() + fadeOut(),
        ) {
            AnimatedContent(
                targetState = badge.orEmpty(),
                transitionSpec = { scaleIn(initialScale = 1.4f) + fadeIn() togetherWith fadeOut() },
                label = "fab-badge",
            ) { text ->
                Text(
                    text = text,
                    color = Color.White,
                    fontFamily = SCNFont,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .defaultMinSize(minWidth = 22.dp, minHeight = 22.dp)
                        .background(colors.destructive, RoundedCornerShape(50))
                        .border(2.dp, colors.background, RoundedCornerShape(50))
                        .padding(horizontal = 6.dp, vertical = 2.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )
            }
        }
    }
}
