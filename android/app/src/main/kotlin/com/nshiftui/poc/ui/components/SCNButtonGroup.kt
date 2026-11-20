package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNButtonGroup(titles: List<String>, onSelect: (String) -> Unit) {
    val shape = RoundedCornerShape(SCNRadius.md)
    val outline = if (theme.dark) colors.input else colors.border
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(SCNSpace.s8)
            .clip(shape)
            .border(1.dp, outline, shape),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        titles.forEachIndexed { index, title ->
            SCNButton(
                title = title,
                modifier = Modifier.weight(1f).fillMaxHeight(),
                variant = SCNButtonVariant.Outline,
                size = SCNButtonSize.Sm,
                grouped = true,
            ) {
                onSelect(title)
            }
            if (index < titles.lastIndex) {
                Box(
                    Modifier
                        .width(1.dp)
                        .fillMaxHeight()
                        .background(outline),
                )
            }
        }
    }
}
