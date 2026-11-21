package com.nshiftui.poc.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNRadius
import com.nshiftui.poc.theme.SCNSpace
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SCNSheet(
    presented: Boolean,
    onDismiss: () -> Unit,
    title: String,
    onPresented: () -> Unit = {},
    content: @Composable (dismiss: () -> Unit) -> Unit,
) {
    val colors = LocalSCNTheme.current.palette
    var retain by remember { mutableStateOf(false) }
    if (presented) {
        retain = true
    }
    if (!retain) return
    val sheetState = rememberModalBottomSheetState()
    val scope = rememberCoroutineScope()
    var reported by remember { mutableStateOf(false) }
    val finishDismiss: () -> Unit = {
        if (!reported) {
            reported = true
            retain = false
            onDismiss()
        }
    }
    val dismiss: () -> Unit = {
        scope.launch {
            sheetState.hide()
            if (!sheetState.isVisible) {
                finishDismiss()
            }
        }
    }
    LaunchedEffect(presented) {
        if (presented) {
            reported = false
            sheetState.show()
            onPresented()
        } else if (!reported) {
            sheetState.hide()
            if (!sheetState.isVisible) {
                finishDismiss()
            }
        }
    }
    ModalBottomSheet(
        onDismissRequest = dismiss,
        sheetState = sheetState,
        containerColor = colors.background,
        contentColor = colors.foreground,
        scrimColor = Color.Black.copy(alpha = 0.4f),
        shape = RoundedCornerShape(topStart = SCNRadius.lg, topEnd = SCNRadius.lg),
        dragHandle = { BottomSheetDefaults.DragHandle(color = colors.mutedForeground) },
    ) {
        Column(
            Modifier.padding(SCNSpace.s4),
            verticalArrangement = Arrangement.spacedBy(SCNSpace.s3),
        ) {
            SCNText(
                title,
                weight = FontWeight.SemiBold,
                modifier = Modifier.fillMaxWidth(),
                align = TextAlign.Center,
            )
            content(dismiss)
        }
    }
}
