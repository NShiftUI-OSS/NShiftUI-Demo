package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
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

enum class SCNAlertVariant { Default, Destructive }

@Composable
fun SCNAlert(title: String, message: String, variant: SCNAlertVariant = SCNAlertVariant.Default) {
    val shape = RoundedCornerShape(SCNRadius.lg)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.card)
            .border(1.dp, if (variant == SCNAlertVariant.Destructive) colors.destructive else colors.border, shape)
            .padding(SCNSpace.s4),
        verticalArrangement = Arrangement.spacedBy(SCNSpace.s1),
    ) {
        SCNText(title, weight = FontWeight.Medium, color = if (variant == SCNAlertVariant.Destructive) SCNTextColor.Destructive else SCNTextColor.Foreground)
        SCNText(message, color = SCNTextColor.Muted)
    }
}
