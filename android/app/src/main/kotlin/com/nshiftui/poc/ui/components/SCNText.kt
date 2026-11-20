package com.nshiftui.poc.ui.components

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNType

enum class SCNTextStyle { Xs, Sm, Base, Lg, Xl, Xl2 }

enum class SCNTextColor {
    Foreground, Muted, Primary, PrimaryForeground, SecondaryForeground,
    AccentForeground, Destructive, White,
}

@Composable
fun SCNText(
    text: String,
    style: SCNTextStyle = SCNTextStyle.Sm,
    weight: FontWeight = FontWeight.Normal,
    color: SCNTextColor = SCNTextColor.Foreground,
    modifier: Modifier = Modifier,
    align: TextAlign? = null,
) {
    val size = when (style) {
        SCNTextStyle.Xs -> SCNType.xs
        SCNTextStyle.Sm -> SCNType.sm
        SCNTextStyle.Base -> SCNType.base
        SCNTextStyle.Lg -> SCNType.lg
        SCNTextStyle.Xl -> SCNType.xl
        SCNTextStyle.Xl2 -> SCNType.xl2
    }
    val ink = ink(color)
    Text(
        text = text,
        modifier = modifier,
        color = ink,
        textAlign = align,
        style = TextStyle(
            fontFamily = SCNFont,
            fontSize = size,
            fontWeight = weight,
            color = ink,
        ),
    )
}

@Composable
internal fun ink(color: SCNTextColor): Color = when (color) {
    SCNTextColor.Foreground -> colors.foreground
    SCNTextColor.Muted -> colors.mutedForeground
    SCNTextColor.Primary -> colors.primary
    SCNTextColor.PrimaryForeground -> colors.primaryForeground
    SCNTextColor.SecondaryForeground -> colors.secondaryForeground
    SCNTextColor.AccentForeground -> colors.accentForeground
    SCNTextColor.Destructive -> colors.destructive
    SCNTextColor.White -> Color.White
}
