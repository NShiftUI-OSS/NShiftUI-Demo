package com.nshiftui.poc.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.Dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNSwitch(isOn: Boolean, onChange: (Boolean) -> Unit) {
    val width = SCNSpace.s12 + SCNSpace.s1
    val height = SCNSpace.s8
    val inset = SCNSpace.s0_5
    val thumb = height - inset * 2
    val travel = width - thumb - inset * 2
    val offset by animateFloatAsState(if (isOn) 1f else 0f, tween(300), label = "switch")
    val track = if (isOn) colors.primary else if (theme.dark) colors.input.copy(alpha = SCNOpacity.pressed) else colors.input
    val knob = if (!theme.dark) colors.background else if (isOn) colors.primaryForeground else colors.foreground
    Box(
        modifier = Modifier
            .size(width, height)
            .clip(CircleShape)
            .background(track)
            .clickable { onChange(!isOn) },
    ) {
        Box(
            Modifier
                .padding(start = inset)
                .offsetDp(travel * offset)
                .size(thumb)
                .clip(CircleShape)
                .background(knob)
                .align(Alignment.CenterStart),
        )
    }
}

private fun Modifier.offsetDp(x: Dp) = this.then(Modifier.padding(start = x))
