package com.nshiftui.poc.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNSlider(value: Float, onChange: (Float) -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(SCNSpace.s4)
            .pointerInput(Unit) {
                detectDragGestures { change, _ ->
                    val width = size.width.toFloat().coerceAtLeast(1f)
                    onChange((change.position.x / width).coerceIn(0f, 1f))
                }
            }
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    val width = size.width.toFloat().coerceAtLeast(1f)
                    onChange((offset.x / width).coerceIn(0f, 1f))
                }
            },
    ) {
        val thumb = SCNSpace.s4
        val trackColor = colors.muted
        val rangeColor = colors.primary
        Canvas(Modifier.fillMaxSize()) {
            val track = 6.dp.toPx()
            val cy = size.height / 2f
            val travel = size.width - thumb.toPx()
            val x = travel * value
            drawRoundRect(trackColor, topLeft = Offset(0f, cy - track / 2), size = Size(size.width, track), cornerRadius = androidx.compose.ui.geometry.CornerRadius(track))
            drawRoundRect(rangeColor, topLeft = Offset(0f, cy - track / 2), size = Size(x + thumb.toPx() / 2, track), cornerRadius = androidx.compose.ui.geometry.CornerRadius(track))
            drawCircle(Color.White, radius = thumb.toPx() / 2, center = Offset(x + thumb.toPx() / 2, cy))
            drawCircle(rangeColor, radius = thumb.toPx() / 2, center = Offset(x + thumb.toPx() / 2, cy), style = Stroke(width = 1.dp.toPx()))
        }
    }
}
