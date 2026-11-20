package com.nshiftui.poc.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

@Composable
fun SCNSpinner() {
    val transition = rememberInfiniteTransition(label = "spin")
    val turn by transition.animateFloat(0f, 360f, infiniteRepeatable(tween(1000, easing = LinearEasing)), label = "turn")
    SCNIcon(
        "loader-circle",
        modifier = Modifier.rotate(turn),
        size = SCNSpace.s4,
        tint = colors.foreground,
    )
}
