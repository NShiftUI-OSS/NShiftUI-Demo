package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNToast(title: String, message: String?) {
    val shape = RoundedCornerShape(SCNRadius.lg)
    Column(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.card)
            .border(1.dp, colors.border, shape)
            .padding(SCNSpace.s3),
    ) {
        SCNText(title, weight = FontWeight.Medium)
        if (message != null) SCNText(message, color = SCNTextColor.Muted)
    }
}
