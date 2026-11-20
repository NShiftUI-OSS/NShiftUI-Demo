package com.nshiftui.poc.ui

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp

private val IosPushEasing = CubicBezierEasing(0.25f, 0.1f, 0.25f, 1f)
private const val IosPushMillis = 350
private const val IosParallax = 0.3f

fun iosPushEnter(forward: Int): EnterTransition =
    slideInHorizontally(
        animationSpec = tween(durationMillis = IosPushMillis, easing = IosPushEasing),
        initialOffsetX = { width -> forward * width },
    )

fun iosPushExit(forward: Int): ExitTransition =
    slideOutHorizontally(
        animationSpec = tween(durationMillis = IosPushMillis, easing = IosPushEasing),
        targetOffsetX = { width -> -(forward * width * IosParallax).toInt() },
    )

fun iosPopEnter(forward: Int): EnterTransition =
    slideInHorizontally(
        animationSpec = tween(durationMillis = IosPushMillis, easing = IosPushEasing),
        initialOffsetX = { width -> -(forward * width * IosParallax).toInt() },
    )

fun iosPopExit(forward: Int): ExitTransition =
    slideOutHorizontally(
        animationSpec = tween(durationMillis = IosPushMillis, easing = IosPushEasing),
        targetOffsetX = { width -> forward * width },
    )

@Composable
fun SCNPage(content: @Composable () -> Unit) {
    Box(
        Modifier
            .fillMaxSize()
            .graphicsLayer {
                shadowElevation = 12.dp.toPx()
                shape = RectangleShape
                clip = true
                ambientShadowColor = Color.Black.copy(alpha = 0.28f)
                spotShadowColor = Color.Black.copy(alpha = 0.22f)
            },
    ) {
        content()
    }
}
