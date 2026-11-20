package com.nshiftui.poc.sdui.observers

import androidx.compose.runtime.staticCompositionLocalOf
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class ScreenRefreshObserver {
    private val subject = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val events = subject.asSharedFlow()
    private var waiter: CompletableDeferred<Unit>? = null

    suspend fun refresh() {
        val pending = CompletableDeferred<Unit>()
        waiter = pending
        subject.emit(Unit)
        pending.await()
    }

    fun finish() {
        waiter?.complete(Unit)
        waiter = null
    }
}

val LocalScreenRefresh = staticCompositionLocalOf<ScreenRefreshObserver?> { null }
