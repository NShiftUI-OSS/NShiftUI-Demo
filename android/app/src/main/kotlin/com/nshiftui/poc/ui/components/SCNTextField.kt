package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.theme.SCNType

@Composable
fun SCNTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    secure: Boolean = false,
    modifier: Modifier = Modifier,
) {
    val shape = RoundedCornerShape(SCNRadius.md)
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = SCNSpace.s11)
            .clip(shape)
            .background(if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else colors.background)
            .border(1.dp, colors.input, shape)
            .padding(horizontal = SCNSpace.s3, vertical = SCNSpace.s3),
        textStyle = TextStyle(fontFamily = SCNFont, color = colors.foreground, fontSize = SCNType.sm),
        cursorBrush = SolidColor(colors.primary),
        visualTransformation = if (secure) PasswordVisualTransformation() else VisualTransformation.None,
        decorationBox = { inner ->
            Box(contentAlignment = Alignment.CenterStart) {
                if (value.isEmpty()) SCNText(placeholder, color = SCNTextColor.Muted)
                inner()
            }
        },
    )
}
