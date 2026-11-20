package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNRadio(title: String, isOn: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.clickable { onChange(!isOn) },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s2),
    ) {
        Box(
            modifier = Modifier
                .size(SCNSpace.s4)
                .clip(CircleShape)
                .background(if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else Color.Transparent)
                .border(1.dp, colors.input, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (isOn) {
                Box(Modifier.size(SCNSpace.s2).clip(CircleShape).background(colors.primary))
            }
        }
        SCNText(title)
    }
}
