package com.nshiftui.poc.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.ui.SCNIcon
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.theme.SCNType

/**
 * Search field of the design system (shadcn-style): input surface with a
 * leading search icon, muted placeholder and a clear button while typing.
 */
@Composable
fun SCNSearchBar(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "Buscar",
    onSubmit: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    val shape = RoundedCornerShape(SCNRadius.md)
    val focus = LocalFocusManager.current
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = SCNSpace.s11)
            .clip(shape)
            // Opaque, so content scrolling under the floating bar never shows through.
            .background(colors.background)
            .background(if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else colors.background)
            .border(1.dp, colors.input, shape)
            .padding(horizontal = SCNSpace.s3),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(SCNSpace.s2),
    ) {
        SCNIcon(name = "search", size = 16.dp, tint = colors.mutedForeground)
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            modifier = Modifier.weight(1f),
            textStyle = TextStyle(fontFamily = SCNFont, color = colors.foreground, fontSize = SCNType.sm),
            cursorBrush = SolidColor(colors.primary),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = {
                focus.clearFocus()
                onSubmit()
            }),
            decorationBox = { inner ->
                Box(contentAlignment = Alignment.CenterStart) {
                    if (value.isEmpty()) SCNText(placeholder, color = SCNTextColor.Muted)
                    inner()
                }
            },
        )
        if (value.isNotEmpty()) {
            Box(
                modifier = Modifier.clickable {
                    onValueChange("")
                    onSubmit()
                },
            ) {
                SCNIcon(name = "x", size = 16.dp, tint = colors.mutedForeground)
            }
        }
    }
}
