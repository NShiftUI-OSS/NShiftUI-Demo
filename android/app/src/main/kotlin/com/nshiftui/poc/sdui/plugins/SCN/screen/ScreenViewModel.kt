package com.nshiftui.poc.sdui.plugins.scn.screen

import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftPluginViewModel
import com.nshiftui.poc.domain.protocols.SendHTTPRequestUseCaseProtocol
import com.nshiftui.poc.sdui.observers.ScreenRefreshObserver
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.suspendCancellableCoroutine

data class ScreenBottomSheet(
    val id: String,
    val presented: Boolean,
)

data class ScreenInput(
    val id: String,
    val value: String,
)

interface ScreenSheetLayer {
    suspend fun openSheet(id: String): Boolean
    suspend fun closeSheet(id: String): Boolean
}

interface ScreenHTTPLayer {
    suspend fun sendHTTPRequest(request: SendHTTPRequest): SendHTTPResponse
}

class ScreenViewModel(
    private val http: SendHTTPRequestUseCaseProtocol,
) :
    NShiftPluginViewModel,
    ScreenSheetLayer,
    ScreenHTTPLayer {
    private val sheetState = MutableStateFlow<List<ScreenBottomSheet>>(emptyList())
    val bottomSheets: StateFlow<List<ScreenBottomSheet>> = sheetState.asStateFlow()

    private val inputState = MutableStateFlow<List<ScreenInput>>(emptyList())
    val inputs: StateFlow<List<ScreenInput>> = inputState.asStateFlow()
    private val routeParametersState = MutableStateFlow<Map<String, String>>(emptyMap())
    val routeParameters: StateFlow<Map<String, String>> = routeParametersState.asStateFlow()
    /** Generic list state: datasets, pagination and `ForEach` filters by list id. */
    val lists = ScreenLists()
    private var didAppear = false
    var renderingEngine: NShiftEngine? = null
        private set

    private var refreshObserver: ScreenRefreshObserver? = null
    private val presentWaiters = mutableMapOf<String, Continuation<Unit>>()
    private val dismissWaiters = mutableMapOf<String, Continuation<Unit>>()

    fun bindEngine(engine: NShiftEngine?) {
        renderingEngine = engine
    }

    fun bindRouteParameters(parameters: Map<String, String>) {
        routeParametersState.value = parameters
    }

    /** Values templates can read: `{{route.x}}` and `{{input.x}}`. */
    fun templateContext(): Map<String, Any?> = mapOf(
        "route" to routeParametersState.value,
        "input" to inputState.value.associate { it.id to it.value },
    )

    /** True only the first time, so `OnAppear` fires once per screen instance. */
    fun markAppeared(): Boolean {
        if (didAppear) return false
        didAppear = true
        return true
    }

    fun bind(refresh: ScreenRefreshObserver?) {
        refreshObserver = refresh
    }

    suspend fun refresh() {
        refreshObserver?.refresh()
    }

    private val sheetRegistrations = mutableMapOf<String, Int>()

    fun registerSheet(id: String) {
        sheetRegistrations[id] = (sheetRegistrations[id] ?: 0) + 1
        if (sheetState.value.any { it.id == id }) return
        sheetState.value = sheetState.value + ScreenBottomSheet(id, presented = false)
    }

    fun unregisterSheet(id: String) {
        val remaining = (sheetRegistrations[id] ?: 1) - 1
        if (remaining > 0) {
            sheetRegistrations[id] = remaining
            return
        }
        sheetRegistrations.remove(id)
        sheetState.value = sheetState.value.filterNot { it.id == id }
    }

    override suspend fun openSheet(id: String): Boolean {
        if (sheetState.value.none { it.id == id }) return false
        sheetState.value = sheetState.value.map { sheet ->
            if (sheet.id == id) sheet.copy(presented = true) else sheet
        }
        suspendCancellableCoroutine { continuation ->
            presentWaiters[id] = continuation
        }
        return true
    }

    override suspend fun closeSheet(id: String): Boolean {
        if (sheetState.value.none { it.id == id }) return false
        sheetState.value = sheetState.value.map { sheet ->
            if (sheet.id == id) sheet.copy(presented = false) else sheet
        }
        suspendCancellableCoroutine { continuation ->
            dismissWaiters[id] = continuation
        }
        return true
    }

    fun didPresent(ids: List<String>) {
        ids.forEach { id -> presentWaiters.remove(id)?.resume(Unit) }
    }

    fun didDismiss(ids: List<String>) {
        sheetState.value = sheetState.value.map { sheet ->
            if (ids.contains(sheet.id)) sheet.copy(presented = false) else sheet
        }
        ids.forEach { id -> dismissWaiters.remove(id)?.resume(Unit) }
    }

    fun registerInput(id: String, value: String) {
        val current = inputState.value
        inputState.value = if (current.any { it.id == id }) {
            current.map { input -> if (input.id == id) input.copy(value = value) else input }
        } else {
            current + ScreenInput(id, value)
        }
    }

    override suspend fun sendHTTPRequest(request: SendHTTPRequest): SendHTTPResponse {
        return http.execute(request)
    }
}
