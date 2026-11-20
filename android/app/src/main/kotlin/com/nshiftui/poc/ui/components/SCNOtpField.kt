package com.nshiftui.poc.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import com.nshiftui.poc.theme.SCNOpacity
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.theme.SCNType

@Composable
fun SCNOtpField(length: Int, code: String, onCodeChange: (String) -> Unit) {
    val slot = SCNSpace.s11
    val stroke = 1.dp
    val fill = if (theme.dark) colors.input.copy(alpha = SCNOpacity.field) else colors.background
    val outline = colors.input
    val ring = colors.ring
    var focused by remember { mutableStateOf(false) }
    val activeIndex = code.length.coerceAtMost(length - 1)
    val caret = rememberInfiniteTransition(label = "otp-caret")
    val caretAlpha by caret.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "caret",
    )
    var field by remember {
        mutableStateOf(TextFieldValue(code, TextRange(code.length)))
    }
    if (field.text != code) {
        field = TextFieldValue(code, TextRange(code.length))
    }
    BasicTextField(
        value = field,
        onValueChange = { next ->
            val filtered = next.text.filter(Char::isDigit).take(length)
            field = TextFieldValue(filtered, TextRange(filtered.length))
            onCodeChange(filtered)
        },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
        singleLine = true,
        textStyle = TextStyle(color = Color.Transparent, fontSize = SCNType.sm),
        cursorBrush = SolidColor(Color.Transparent),
        modifier = Modifier.onFocusChanged { focused = it.isFocused },
        decorationBox = { inner ->
            Box(
                Modifier
                    .width(slot * length - stroke * (length - 1))
                    .height(slot),
            ) {
                Box(Modifier.matchParentSize().alpha(0f)) { inner() }
                repeat(length) { index ->
                    val active = focused && index == activeIndex
                    val symbol = code.getOrNull(index)?.toString().orEmpty()
                    Box(
                        Modifier
                            .offset(x = (slot - stroke) * index)
                            .size(slot)
                            .zIndex(if (active) 1f else 0f)
                            .drawBehind {
                                drawOtpSlot(
                                    index = index,
                                    count = length,
                                    active = active,
                                    fill = fill,
                                    outline = outline,
                                    ring = ring,
                                )
                            },
                        contentAlignment = Alignment.Center,
                    ) {
                        SCNText(symbol, weight = FontWeight.Medium)
                        if (active && symbol.isEmpty()) {
                            Box(
                                Modifier
                                    .width(1.dp)
                                    .height(SCNSpace.s4)
                                    .background(colors.foreground.copy(alpha = caretAlpha)),
                            )
                        }
                    }
                }
            }
        },
    )
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawOtpSlot(
    index: Int,
    count: Int,
    active: Boolean,
    fill: Color,
    outline: Color,
    ring: Color,
) {
    val stroke = 1.dp.toPx()
    val radius = SCNRadius.md.toPx()
    val leading = if (index == 0) radius else 0f
    val trailing = if (index == count - 1) radius else 0f
    val inset = stroke / 2f
    val body = RoundRect(
        rect = Rect(inset, inset, size.width - inset, size.height - inset),
        topLeft = CornerRadius(leading, leading),
        topRight = CornerRadius(trailing, trailing),
        bottomRight = CornerRadius(trailing, trailing),
        bottomLeft = CornerRadius(leading, leading),
    )
    drawPath(Path().apply { addRoundRect(body) }, fill)
    drawPath(
        Path().apply { addRoundRect(body) },
        color = if (active) ring else outline,
        style = Stroke(width = stroke),
    )
    if (!active) return
    val glow = 3.dp.toPx()
    val outset = glow / 2f
    val glowLeading = if (leading > 0f) leading + outset else 0f
    val glowTrailing = if (trailing > 0f) trailing + outset else 0f
    val halo = RoundRect(
        rect = Rect(-outset, -outset, size.width + outset, size.height + outset),
        topLeft = CornerRadius(glowLeading, glowLeading),
        topRight = CornerRadius(glowTrailing, glowTrailing),
        bottomRight = CornerRadius(glowTrailing, glowTrailing),
        bottomLeft = CornerRadius(glowLeading, glowLeading),
    )
    drawPath(
        Path().apply { addRoundRect(halo) },
        color = ring.copy(alpha = 0.5f),
        style = Stroke(width = glow),
    )
}
