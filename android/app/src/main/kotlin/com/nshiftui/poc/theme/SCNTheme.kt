package com.nshiftui.poc.theme

import androidx.compose.material3.LocalTextStyle
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class SCNThemeId(val title: String) {
    Neutral("Neutral"),
    Stone("Stone"),
    Zinc("Zinc"),
    Mauve("Mauve"),
    Olive("Olive"),
    Mist("Mist"),
    Taupe("Taupe"),
    Amber("Amber"),
    Blue("Blue"),
    Cyan("Cyan"),
    Emerald("Emerald"),
    Fuchsia("Fuchsia"),
    Green("Green"),
    Indigo("Indigo"),
    Lime("Lime"),
    Orange("Orange"),
    Pink("Pink"),
    Purple("Purple"),
    Red("Red"),
    Rose("Rose"),
    Sky("Sky"),
    Teal("Teal"),
    Violet("Violet"),
    Yellow("Yellow"),
    ;

    companion object {
        fun resolve(raw: String): SCNThemeId? {
            val key = raw.trim()
            if (key.isEmpty()) return null
            return entries.firstOrNull { id ->
                id.name.equals(key, ignoreCase = true) || id.title.equals(key, ignoreCase = true)
            }
        }
    }
}

data class SCNPalette(
    val background: Color,
    val foreground: Color,
    val card: Color,
    val cardForeground: Color,
    val primary: Color,
    val primaryForeground: Color,
    val secondary: Color,
    val secondaryForeground: Color,
    val muted: Color,
    val mutedForeground: Color,
    val accent: Color,
    val accentForeground: Color,
    val destructive: Color,
    val border: Color,
    val input: Color,
    val ring: Color,
)

data class SCNPreset(
    val id: SCNThemeId,
    val light: SCNPalette,
    val dark: SCNPalette,
)

object SCNSpace {
    val s0 = 0.dp
    val s0_5 = 2.dp
    val s1 = 4.dp
    val s1_5 = 6.dp
    val s2 = 8.dp
    val s2_5 = 10.dp
    val s3 = 12.dp
    val s3_5 = 14.dp
    val s4 = 16.dp
    val s5 = 20.dp
    val s6 = 24.dp
    val s8 = 32.dp
    val s9 = 36.dp
    val s10 = 40.dp
    val s11 = 44.dp
    val s12 = 48.dp
    val s16 = 64.dp
}

object SCNRadius {
    val sm = 6.dp
    val md = 8.dp
    val lg = 10.dp
    val xl = 14.dp
}

object SCNType {
    val xs = 12.sp
    val sm = 14.sp
    val base = 16.sp
    val lg = 18.sp
    val xl = 20.sp
    val xl2 = 24.sp
}

object SCNOpacity {
    const val opaque = 1f
    const val disabled = 0.5f
    const val pressed = 0.8f
    const val subtle = 0.1f
    const val field = 0.3f
}

data class SCNTheme(
    val preset: SCNPreset,
    val dark: Boolean,
) {
    val palette: SCNPalette = if (dark) preset.dark else preset.light
    val fontFamily: String = "Geist"
}

val LocalSCNTheme = staticCompositionLocalOf {
    SCNTheme(preset = SCNPresets.neutral, dark = false)
}

@Composable
fun ProvideSCNTheme(
    theme: SCNTheme,
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(
        LocalSCNTheme provides theme,
        LocalTextStyle provides TextStyle(fontFamily = SCNFont),
        content = content,
    )
}

private fun hsl(h: Float, s: Float, l: Float): Color {
    val hue = h / 360f
    val saturation = s / 100f
    val lightness = l / 100f
    if (saturation == 0f) return Color(lightness, lightness, lightness)
    val q = if (lightness < 0.5f) lightness * (1f + saturation) else lightness + saturation - lightness * saturation
    val p = 2f * lightness - q
    fun channel(t0: Float): Float {
        var t = t0
        if (t < 0f) t += 1f
        if (t > 1f) t -= 1f
        return when {
            t < 1f / 6f -> p + (q - p) * 6f * t
            t < 0.5f -> q
            t < 2f / 3f -> p + (q - p) * (2f / 3f - t) * 6f
            else -> p
        }
    }
    return Color(channel(hue + 1f / 3f), channel(hue), channel(hue - 1f / 3f))
}

private fun neutral(light: Boolean, primaryHue: Float? = null): SCNPalette {
    return if (!light) {
        SCNPalette(
            background = hsl(0f, 0f, 3.9f),
            foreground = hsl(0f, 0f, 98f),
            card = hsl(0f, 0f, 3.9f),
            cardForeground = hsl(0f, 0f, 98f),
            primary = if (primaryHue == null) hsl(0f, 0f, 98f) else hsl(primaryHue, 70f, 60f),
            primaryForeground = if (primaryHue == null) hsl(0f, 0f, 9f) else hsl(0f, 0f, 98f),
            secondary = hsl(0f, 0f, 14.9f),
            secondaryForeground = hsl(0f, 0f, 98f),
            muted = hsl(0f, 0f, 14.9f),
            mutedForeground = hsl(0f, 0f, 63.9f),
            accent = hsl(0f, 0f, 14.9f),
            accentForeground = hsl(0f, 0f, 98f),
            destructive = hsl(0f, 62.8f, 30.6f),
            border = hsl(0f, 0f, 14.9f),
            input = hsl(0f, 0f, 14.9f),
            ring = if (primaryHue == null) hsl(0f, 0f, 83.1f) else hsl(primaryHue, 70f, 60f),
        )
    } else {
        SCNPalette(
            background = hsl(0f, 0f, 100f),
            foreground = hsl(0f, 0f, 3.9f),
            card = hsl(0f, 0f, 100f),
            cardForeground = hsl(0f, 0f, 3.9f),
            primary = if (primaryHue == null) hsl(0f, 0f, 9f) else hsl(primaryHue, 72f, 40f),
            primaryForeground = hsl(0f, 0f, 98f),
            secondary = hsl(0f, 0f, 96.1f),
            secondaryForeground = hsl(0f, 0f, 9f),
            muted = hsl(0f, 0f, 96.1f),
            mutedForeground = hsl(0f, 0f, 45.1f),
            accent = hsl(0f, 0f, 96.1f),
            accentForeground = hsl(0f, 0f, 9f),
            destructive = hsl(0f, 84.2f, 60.2f),
            border = hsl(0f, 0f, 89.8f),
            input = hsl(0f, 0f, 89.8f),
            ring = if (primaryHue == null) hsl(0f, 0f, 3.9f) else hsl(primaryHue, 72f, 40f),
        )
    }
}

private fun preset(id: SCNThemeId, hue: Float?): SCNPreset =
    SCNPreset(id, neutral(light = true, hue), neutral(light = false, hue))

object SCNPresets {
    val neutral = preset(SCNThemeId.Neutral, null)
    val all: List<SCNPreset> = listOf(
        neutral,
        preset(SCNThemeId.Stone, null),
        preset(SCNThemeId.Zinc, null),
        preset(SCNThemeId.Mauve, 322f),
        preset(SCNThemeId.Olive, 107f),
        preset(SCNThemeId.Mist, 224f),
        preset(SCNThemeId.Taupe, 43f),
        preset(SCNThemeId.Amber, 49f),
        preset(SCNThemeId.Blue, 221f),
        preset(SCNThemeId.Cyan, 223f),
        preset(SCNThemeId.Emerald, 166f),
        preset(SCNThemeId.Fuchsia, 324f),
        preset(SCNThemeId.Green, 142f),
        preset(SCNThemeId.Indigo, 277f),
        preset(SCNThemeId.Lime, 129f),
        preset(SCNThemeId.Orange, 25f),
        preset(SCNThemeId.Pink, 4f),
        preset(SCNThemeId.Purple, 302f),
        preset(SCNThemeId.Red, 0f),
        preset(SCNThemeId.Rose, 347f),
        preset(SCNThemeId.Sky, 243f),
        preset(SCNThemeId.Teal, 186f),
        preset(SCNThemeId.Violet, 262f),
        preset(SCNThemeId.Yellow, 48f),
    )

    fun named(id: SCNThemeId): SCNPreset = all.first { it.id == id }
}

fun Dp.hairline(): Dp = 1.dp
