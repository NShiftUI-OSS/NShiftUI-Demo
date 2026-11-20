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
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNItem(title: String, subtitle: String, initials: String? = null) {
    val shape = RoundedCornerShape(SCNRadius.lg)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.card)
            .border(1.dp, colors.border, shape)
            .padding(SCNSpace.s3),
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s3),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (initials != null) SCNAvatar(initials)
        Column {
            SCNText(title, weight = FontWeight.Medium)
            SCNText(subtitle, style = SCNTextStyle.Xs, color = SCNTextColor.Muted)
        }
    }
}
