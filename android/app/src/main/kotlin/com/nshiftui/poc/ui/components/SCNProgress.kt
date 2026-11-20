package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNProgress(value: Float) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(SCNSpace.s2)
            .clip(CircleShape)
            .background(colors.primary.copy(alpha = 0.2f)),
    ) {
        Box(
            Modifier
                .fillMaxWidth(value.coerceIn(0f, 1f))
                .fillMaxHeight()
                .background(colors.primary),
        )
    }
}
