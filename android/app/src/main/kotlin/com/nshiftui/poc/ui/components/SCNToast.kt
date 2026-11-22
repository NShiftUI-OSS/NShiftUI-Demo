package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

@Composable
fun SCNToast(title: String, message: String?, icon: String? = null, modifier: Modifier = Modifier) {
    val colors = LocalSCNTheme.current.palette
    val shape = RoundedCornerShape(SCNRadius.lg)
    Row(
        modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.card)
            .border(1.dp, colors.border, shape)
            .padding(SCNSpace.s3),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s3),
    ) {
        if (!icon.isNullOrEmpty()) {
            SCNIcon(icon, size = SCNSpace.s5, tint = colors.foreground)
        }
        Column {
            SCNText(title, weight = FontWeight.Medium)
            if (!message.isNullOrEmpty()) SCNText(message, color = SCNTextColor.Muted)
        }
    }
}
