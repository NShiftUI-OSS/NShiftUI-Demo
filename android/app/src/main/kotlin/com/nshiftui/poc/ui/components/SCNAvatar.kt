package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import com.nshiftui.poc.theme.SCNSpace

enum class SCNAvatarSize { Sm, Default, Lg }

@Composable
fun SCNAvatar(initials: String, size: SCNAvatarSize = SCNAvatarSize.Default) {
    val side = when (size) {
        SCNAvatarSize.Sm -> SCNSpace.s6
        SCNAvatarSize.Default -> SCNSpace.s8
        SCNAvatarSize.Lg -> SCNSpace.s10
    }
    Box(Modifier.size(side).clip(CircleShape).background(colors.muted), contentAlignment = Alignment.Center) {
        SCNText(initials, style = if (size == SCNAvatarSize.Lg) SCNTextStyle.Sm else SCNTextStyle.Xs, weight = FontWeight.Medium, color = SCNTextColor.Muted)
    }
}
