package com.nshiftui.poc.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow

data class SuccessMessage(val title: String, val message: String)

/** Global success feedback shown over every screen by [SCNSuccessOverlayHost]. */
object SuccessOverlay {
    val current = MutableStateFlow<SuccessMessage?>(null)

    suspend fun show(title: String, message: String) {
        current.value = SuccessMessage(title, message)
        delay(1900)
        current.value = null
        delay(260)
    }
}

@Composable
fun SCNSuccessOverlayHost() {
    val message by SuccessOverlay.current.collectAsState()
    AnimatedVisibility(
        visible = message != null,
        enter = fadeIn(tween(200)),
        exit = fadeOut(tween(250)),
    ) {
        val shown = remember { message } ?: message ?: return@AnimatedVisibility
        SuccessCard(shown)
    }
}

@Composable
private fun SuccessCard(message: SuccessMessage) {
    val theme = LocalSCNTheme.current
    val colors = theme.palette
    val pop = remember { Animatable(0.4f) }
    val drawn = remember { Animatable(0f) }
    LaunchedEffect(message) {
        pop.animateTo(1f, spring(dampingRatio = 0.55f, stiffness = Spring.StiffnessMediumLow))
    }
    LaunchedEffect(message) {
        delay(250)
        drawn.animateTo(1f, tween(450))
    }
    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.45f))
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) {},
        contentAlignment = Alignment.Center,
    ) {
        Column(
            Modifier
                .widthIn(max = 300.dp)
                .scale(0.85f + 0.15f * ((pop.value - 0.4f) / 0.6f).coerceIn(0f, 1.2f))
                .background(colors.card, RoundedCornerShape(SCNRadius.xl))
                .border(1.dp, colors.border, RoundedCornerShape(SCNRadius.xl))
                .padding(SCNSpace.s6),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(SCNSpace.s4),
        ) {
            Box(
                Modifier
                    .size(88.dp)
                    .scale(pop.value)
                    .background(colors.primary, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                val ink = colors.primaryForeground
                Canvas(Modifier.size(width = 40.dp, height = 30.dp)) {
                    val path = Path().apply {
                        moveTo(0f, size.height / 2)
                        lineTo(size.width * 0.38f, size.height)
                        lineTo(size.width, 0f)
                    }
                    val measure = PathMeasure().apply { setPath(path, false) }
                    val partial = Path()
                    measure.getSegment(0f, measure.length * drawn.value, partial, true)
                    drawPath(
                        partial,
                        ink,
                        style = Stroke(width = 7.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
                    )
                }
            }
            if (message.title.isNotEmpty()) {
                SCNText(message.title, style = SCNTextStyle.Lg, weight = FontWeight.SemiBold)
            }
            if (message.message.isNotEmpty()) {
                SCNText(message.message, color = SCNTextColor.Muted, align = TextAlign.Center)
            }
        }
    }
}
