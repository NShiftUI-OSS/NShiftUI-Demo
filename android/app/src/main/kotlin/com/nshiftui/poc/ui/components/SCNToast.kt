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
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.Text
import com.nshiftui.poc.theme.SCNFont
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon

/** Feedback colors follow shadcn's Sonner `richColors`. */
enum class SCNToastVariant { Default, Success, Error, Info, Warning;
    companion object {
        fun from(raw: String) = entries.firstOrNull { it.name.equals(raw, ignoreCase = true) } ?: Default
    }
}

private data class ToastColors(val background: Color, val border: Color, val foreground: Color, val secondary: Color)

@Composable
private fun toastColors(variant: SCNToastVariant): ToastColors {
    val theme = LocalSCNTheme.current
    val colors = theme.palette
    fun rich(light: Triple<Long, Long, Long>, dark: Triple<Long, Long, Long>): ToastColors {
        val values = if (theme.dark) dark else light
        val text = Color(values.third)
        return ToastColors(Color(values.first), Color(values.second), text, text.copy(alpha = 0.85f))
    }
    return when (variant) {
        SCNToastVariant.Default -> ToastColors(colors.card, colors.border, colors.foreground, colors.mutedForeground)
        SCNToastVariant.Success -> rich(Triple(0xFFECFDF3, 0xFFBFFCD9, 0xFF008A2E), Triple(0xFF001F0F, 0xFF003D1C, 0xFF59F3A6))
        SCNToastVariant.Error -> rich(Triple(0xFFFFF0F0, 0xFFFFE0E1, 0xFFE60000), Triple(0xFF2D0607, 0xFF4D0408, 0xFFFF9EA1))
        SCNToastVariant.Info -> rich(Triple(0xFFF0F8FF, 0xFFD3E0FD, 0xFF0973DC), Triple(0xFF000D1F, 0xFF00113D, 0xFF5896F3))
        SCNToastVariant.Warning -> rich(Triple(0xFFFFFCF0, 0xFFFDF5D3, 0xFFDC7609), Triple(0xFF1D1F00, 0xFF3D3D00, 0xFFF3CF58))
    }
}

@Composable
fun SCNToast(
    title: String,
    message: String?,
    icon: String? = null,
    modifier: Modifier = Modifier,
    variant: SCNToastVariant = SCNToastVariant.Default,
) {
    val palette = toastColors(variant)
    val shape = RoundedCornerShape(SCNRadius.lg)
    Row(
        modifier
            .fillMaxWidth()
            .clip(shape)
            .background(palette.background)
            .border(1.dp, palette.border, shape)
            .padding(SCNSpace.s3),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s3),
    ) {
        if (!icon.isNullOrEmpty()) {
            SCNIcon(icon, size = SCNSpace.s5, tint = palette.foreground)
        }
        Column {
            Text(title, color = palette.foreground, fontFamily = SCNFont, fontWeight = FontWeight.Medium, fontSize = 14.sp)
            if (!message.isNullOrEmpty()) {
                Text(message, color = palette.secondary, fontFamily = SCNFont, fontSize = 12.sp)
            }
        }
    }
}
