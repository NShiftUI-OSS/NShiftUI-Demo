package com.nshiftui.poc.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MenuDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

@Composable
fun SCNSelect(options: List<String>, selection: String, onSelect: (String) -> Unit) {
    var open by remember { mutableStateOf(false) }
    val shape = RoundedCornerShape(SCNRadius.md)
    Box {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = SCNSpace.s11)
                .clip(shape)
                .background(if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else Color.Transparent)
                .border(1.dp, colors.input, shape)
                .clickable { open = true }
                .padding(horizontal = SCNSpace.s3),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SCNText(selection, modifier = Modifier.weight(1f))
            SCNIcon(
                "chevron-down",
                size = SCNSpace.s4,
                tint = colors.mutedForeground.copy(alpha = 0.5f),
            )
        }
        DropdownMenu(
            expanded = open,
            onDismissRequest = { open = false },
            shape = RoundedCornerShape(SCNRadius.md),
            containerColor = colors.card,
            tonalElevation = 0.dp,
            shadowElevation = SCNSpace.s2,
            border = BorderStroke(1.dp, colors.border),
        ) {
            options.forEach { option ->
                val selected = option == selection
                DropdownMenuItem(
                    text = {
                        SCNText(
                            option,
                            weight = if (selected) FontWeight.Medium else FontWeight.Normal,
                        )
                    },
                    leadingIcon = if (selected) {
                        { SCNIcon("check", size = SCNSpace.s4, tint = colors.foreground) }
                    } else {
                        null
                    },
                    colors = MenuDefaults.itemColors(
                        textColor = colors.foreground,
                        leadingIconColor = colors.foreground,
                    ),
                    onClick = {
                        onSelect(option)
                        open = false
                    },
                )
            }
        }
    }
}
