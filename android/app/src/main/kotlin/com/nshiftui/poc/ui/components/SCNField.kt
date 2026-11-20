package com.nshiftui.poc.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import com.nshiftui.poc.theme.SCNSpace

@Composable
fun SCNField(label: String, hint: String? = null, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(SCNSpace.s2)) {
        SCNText(label, weight = FontWeight.Medium)
        content()
        if (hint != null) SCNText(hint, style = SCNTextStyle.Xs, color = SCNTextColor.Muted)
    }
}
