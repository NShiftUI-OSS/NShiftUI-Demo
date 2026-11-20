package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNToggleGroup(options: List<String>, selection: String, onSelect: (String) -> Unit) {
    val shape = RoundedCornerShape(SCNRadius.md)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .border(1.dp, colors.border, shape),
    ) {
        options.forEach { option ->
            val selected = option == selection
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(SCNSpace.s9)
                    .background(if (selected) colors.accent else Color.Transparent)
                    .clickable { onSelect(option) },
                contentAlignment = Alignment.Center,
            ) {
                SCNText(option, weight = FontWeight.Medium, color = if (selected) SCNTextColor.AccentForeground else SCNTextColor.Foreground)
            }
        }
    }
}
