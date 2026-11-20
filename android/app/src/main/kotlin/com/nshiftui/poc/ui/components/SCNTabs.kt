package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNTabs(titles: List<String>, selection: String, onSelect: (String) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(SCNSpace.s9)
            .clip(RoundedCornerShape(SCNRadius.md))
            .background(colors.muted)
            .padding(3.dp),
    ) {
        titles.forEach { title ->
            val selected = title == selection
            val fill = when {
                !selected -> Color.Transparent
                theme.dark -> colors.input.copy(alpha = SCNOpacity.field)
                else -> colors.background
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(SCNRadius.sm))
                    .background(fill)
                    .border(if (selected && theme.dark) 1.dp else 0.dp, if (selected && theme.dark) colors.input else Color.Transparent, RoundedCornerShape(SCNRadius.sm))
                    .clickable { onSelect(title) },
                contentAlignment = Alignment.Center,
            ) {
                SCNText(title, weight = FontWeight.Medium, color = if (selected) SCNTextColor.Foreground else SCNTextColor.Muted)
            }
        }
    }
}
