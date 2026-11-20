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
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.theme.SCNType

@Composable
fun SCNTextArea(value: String, onValueChange: (String) -> Unit, placeholder: String = "") {
    val shape = RoundedCornerShape(SCNRadius.md)
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = SCNSpace.s16)
            .clip(shape)
            .background(if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else colors.background)
            .border(1.dp, colors.input, shape)
            .padding(SCNSpace.s3),
        textStyle = TextStyle(fontFamily = SCNFont, color = colors.foreground, fontSize = SCNType.sm),
        cursorBrush = SolidColor(colors.primary),
        decorationBox = { inner ->
            Box {
                if (value.isEmpty()) SCNText(placeholder, color = SCNTextColor.Muted)
                inner()
            }
        },
    )
}
