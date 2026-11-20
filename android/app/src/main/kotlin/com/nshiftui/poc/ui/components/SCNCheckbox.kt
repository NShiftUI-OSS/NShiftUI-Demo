package com.nshiftui.poc.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNCheckbox(title: String, isOn: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.clickable { onChange(!isOn) },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s2),
    ) {
        val fill = when {
            isOn -> colors.primary
            theme.dark -> colors.input.copy(alpha = SCNOpacity.field)
            else -> Color.Transparent
        }
        Box(
            modifier = Modifier
                .size(SCNSpace.s4)
                .clip(RoundedCornerShape(SCNSpace.s1))
                .background(fill)
                .border(1.dp, if (isOn) colors.primary else colors.input, RoundedCornerShape(SCNSpace.s1)),
            contentAlignment = Alignment.Center,
        ) {
            if (isOn) {
                val ink = colors.primaryForeground
                Canvas(Modifier.size(SCNSpace.s3_5)) {
                    val path = Path().apply {
                        moveTo(size.width * 0.167f, size.height * 0.5f)
                        lineTo(size.width * 0.375f, size.height * 0.708f)
                        lineTo(size.width * 0.833f, size.height * 0.25f)
                    }
                    drawPath(path, ink, style = Stroke(width = 2.2f, cap = StrokeCap.Round))
                }
            }
        }
        SCNText(title)
    }
}
