package com.nshiftui.poc.ui

import android.graphics.Bitmap
import android.graphics.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.size as iconSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.nshiftui.poc.theme.LocalSCNTheme
import kotlin.math.roundToInt

@Composable
fun SCNIcon(
    name: String,
    modifier: Modifier = Modifier,
    size: Dp = 24.dp,
    tint: Color = LocalSCNTheme.current.palette.foreground,
) {
    val context = LocalContext.current
    val density = LocalDensity.current
    val id = remember(name) {
        context.resources.getIdentifier(
            "ic_${name.replace('-', '_')}",
            "drawable",
            context.packageName,
        )
    }
    if (id == 0) return
    val pixelSize = with(density) { size.toPx() }.roundToInt().coerceAtLeast(1)
    val bitmap = remember(id, tint, pixelSize) {
        val drawable = ContextCompat.getDrawable(context, id)?.mutate() ?: return@remember null
        drawable.setTint(tint.toArgb())
        val image = Bitmap.createBitmap(pixelSize, pixelSize, Bitmap.Config.ARGB_8888)
        drawable.setBounds(0, 0, pixelSize, pixelSize)
        drawable.draw(Canvas(image))
        image.asImageBitmap()
    } ?: return
    Image(
        bitmap = bitmap,
        contentDescription = null,
        modifier = modifier.iconSize(size),
    )
}
