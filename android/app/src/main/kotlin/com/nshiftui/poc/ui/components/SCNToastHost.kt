package com.nshiftui.poc.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import java.util.UUID
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

data class ToastMessage(
    val title: String,
    val message: String,
    val icon: String,
    val variant: SCNToastVariant = SCNToastVariant.Default,
    val id: String = UUID.randomUUID().toString(),
)

/** Global toast shown at the top of every screen by [SCNToastHost]; a new one replaces it. */
object ToastOverlay {
    val current = MutableStateFlow<ToastMessage?>(null)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var hideJob: Job? = null

    fun show(toast: ToastMessage, durationSeconds: Double) {
        current.value = toast
        hideJob?.cancel()
        hideJob = scope.launch {
            delay((durationSeconds * 1000).toLong())
            current.value = null
        }
    }
}

@Composable
fun SCNToastHost() {
    val toast by ToastOverlay.current.collectAsState()
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
        AnimatedContent(
            targetState = toast,
            transitionSpec = {
                (slideInVertically(tween(300)) { -it } + fadeIn(tween(300))) togetherWith
                    (slideOutVertically(tween(250)) { -it } + fadeOut(tween(250)))
            },
            contentKey = { it?.id },
            label = "toast",
        ) { shown ->
            if (shown != null) {
                SCNToast(
                    title = shown.title,
                    message = shown.message,
                    icon = shown.icon,
                    variant = shown.variant,
                    modifier = Modifier
                        .statusBarsPadding()
                        .padding(horizontal = SCNSpace.s4, vertical = SCNSpace.s2)
                        .shadow(12.dp, RoundedCornerShape(SCNRadius.lg)),
                )
            } else {
                Box(Modifier.fillMaxWidth())
            }
        }
    }
}
