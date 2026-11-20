package com.nshiftui.poc.sdui.triggers

import com.nshiftui.AnyNShiftMetadata
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

val NShiftTrigger.Companion.onTap: NShiftTrigger
    get() = NShiftTrigger("onTap")

val NShiftTrigger.Companion.onChange: NShiftTrigger
    get() = NShiftTrigger("onChange")

val NShiftTrigger.Companion.onSelect: NShiftTrigger
    get() = NShiftTrigger("onSelect")

val NShiftTrigger.Companion.onDismiss: NShiftTrigger
    get() = NShiftTrigger("onDismiss")

val NShiftTrigger.Companion.onComplete: NShiftTrigger
    get() = NShiftTrigger("onComplete")

val NShiftTrigger.Companion.onPresent: NShiftTrigger
    get() = NShiftTrigger("onPresent")

val NShiftTrigger.Companion.onFailure: NShiftTrigger
    get() = NShiftTrigger("onFailure")

fun NShiftTrigger.Companion.onStatusCode(statusCode: Int): NShiftTrigger? =
    runCatching { NShiftTrigger("onStatusCode$statusCode") }.getOrNull()

fun NShiftPlugin.fire(
    trigger: NShiftTrigger,
    scope: CoroutineScope,
) {
    val current = engine ?: return
    val pluginID = model.id ?: renderID.rawValue
    scope.launch {
        current.handle(trigger, pluginID)
    }
}

fun NShiftPlugin.store(
    metadata: NShiftMetadata,
    trigger: NShiftTrigger,
    scope: CoroutineScope,
) {
    val current = engine ?: return
    val pluginID = model.id ?: renderID.rawValue
    scope.launch {
        current.handle(trigger, pluginID)
    }
}

@Composable
fun NShiftPlugin.trackScreenInput(value: String) {
    val screen = optionalViewModel<ScreenViewModel>() ?: return
    val id = model.id ?: renderID.rawValue
    LaunchedEffect(id, value) {
        screen.registerInput(id, value)
    }
}
