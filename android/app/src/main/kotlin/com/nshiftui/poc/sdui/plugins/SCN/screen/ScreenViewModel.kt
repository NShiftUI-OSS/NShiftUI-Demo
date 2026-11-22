package com.nshiftui.poc.sdui.plugins.scn.screen

import com.nshiftui.AnyNShiftMetadata
import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftPluginViewModel
import com.nshiftui.poc.sdui.plugins.scn.avatar.AvatarMetadata
import com.nshiftui.poc.sdui.plugins.scn.text.TextMetadata
import com.nshiftui.poc.domain.protocols.SendHTTPRequestUseCaseProtocol
import com.nshiftui.poc.sdui.observers.ScreenRefreshObserver
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

data class ScreenBottomSheet(
    val id: String,
    val presented: Boolean,
)

data class ScreenInput(
    val id: String,
    val value: String,
)

@Serializable
private data class PokedexPageResponse(
    val results: List<PokedexResult> = emptyList(),
    val next: String? = null,
)

@Serializable
private data class PokedexResult(
    val name: String,
    val url: String,
)

private data class PokedexPaginationState(
    var offset: Int = 3,
    var loading: Boolean = false,
    var exhausted: Boolean = false,
)

private val PokedexJson = Json { ignoreUnknownKeys = true }

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
    private val contentRevisionState = MutableStateFlow(0)
    val contentRevision: StateFlow<Int> = contentRevisionState.asStateFlow()
    private val paginationMutex = Mutex()
    private val pokedexPagination = mutableMapOf<String, PokedexPaginationState>()
    var renderingEngine: NShiftEngine? = null
        private set

    private var refreshObserver: ScreenRefreshObserver? = null
    private val presentWaiters = mutableMapOf<String, Continuation<Unit>>()
    private val dismissWaiters = mutableMapOf<String, Continuation<Unit>>()

    fun bindEngine(engine: NShiftEngine?) {
        renderingEngine = engine
    }

    fun bind(refresh: ScreenRefreshObserver?) {
        refreshObserver = refresh
    }

    suspend fun refresh() {
        refreshObserver?.refresh()
    }

    fun registerSheet(id: String) {
        if (sheetState.value.any { it.id == id }) return
        sheetState.value = sheetState.value + ScreenBottomSheet(id, presented = false)
    }

    fun unregisterSheet(id: String) {
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

    suspend fun appendPokedexPage(
        engine: NShiftEngine?,
        parentID: String,
        endpoint: String,
        limit: Int,
    ): SendHTTPResponse {
        val offset = paginationMutex.withLock {
            val state = pokedexPagination.getOrPut(parentID) { PokedexPaginationState() }
            if (state.loading || state.exhausted) return@withLock null
            state.loading = true
            state.offset
        } ?: return SendHTTPResponse(status = 204, body = "")

        try {
            val response = sendHTTPRequest(
                SendHTTPRequest(
                    method = "GET",
                    path = endpoint,
                    headers = emptyMap(),
                    query = mapOf(
                        "offset" to offset.toString(),
                        "limit" to limit.toString(),
                    ),
                    body = "",
                ),
            )
            if (response.status !in 200..299) return response
            val page = PokedexJson.decodeFromString<PokedexPageResponse>(response.body)
            if (page.results.isEmpty()) {
                paginationMutex.withLock {
                    pokedexPagination[parentID]?.exhausted = true
                }
                return response
            }

            val tree = engine as? NShiftEngineTree
            val located = tree?.node(parentID)
            val parent = located ?: tree?.root?.findFirst {
                    it.model.name.rawValue == "VerticalStack"
                }
            val template = parent?.model?.children
                ?.firstNotNullOfOrNull(::findCardTemplate)
            if (tree == null || parent == null || template == null) {
                return response
            }

            val appended = page.results.map { result ->
                makePokedexCard(template, result)
            }
            val children = parent.model.children
            val nextChildren = children.toMutableList().apply {
                val insertionIndex = children.indexOfLast {
                    it.name.rawValue == "Card"
                } + 1
                addAll(
                    if (insertionIndex > 0) insertionIndex else children.size,
                    appended,
                )
            }
            tree.replaceChildren(parent.id.rawValue, nextChildren)
            contentRevisionState.value += 1

            paginationMutex.withLock {
                pokedexPagination[parentID]?.apply {
                    this.offset += page.results.size
                    this.exhausted = page.next == null
                }
            }
            return response
        } finally {
            paginationMutex.withLock {
                pokedexPagination[parentID]?.loading = false
            }
        }
    }

    private fun makePokedexCard(
        template: NShiftPluginModel,
        result: PokedexResult,
    ): NShiftPluginModel {
        var textIndex = 0
        val number = result.url.trimEnd('/').substringAfterLast('/')
        val imageURL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/$number.png"

        fun replace(model: NShiftPluginModel): NShiftPluginModel {
            var next = model
            when (model.name.rawValue) {
                "Avatar" -> {
                    val avatar = model.metadata?.unwrap<AvatarMetadata>()
                    if (avatar != null) {
                        next = model.replacingMetadata(
                            AnyNShiftMetadata(
                                AvatarMetadata(
                                    initials = number,
                                    size = avatar.size,
                                    imageURL = imageURL,
                                ),
                            ),
                        )
                    }
                }
                "Text" -> {
                    val text = model.metadata?.unwrap<TextMetadata>()
                    if (text != null) {
                        val replacement = when (textIndex++) {
                            0 -> result.name.replaceFirstChar { it.uppercase() }
                            1 -> "#$number · PokeAPI"
                            else -> text.text
                        }
                        next = model.replacingMetadata(
                            AnyNShiftMetadata(
                                text.copy(text = replacement),
                            ),
                        )
                    }
                }
            }
            return next.replacingChildren(model.children.map(::replace))
        }

        return replace(template)
    }

    private fun NShiftPluginNode.findFirst(
        predicate: (NShiftPluginNode) -> Boolean,
    ): NShiftPluginNode? {
        if (predicate(this)) return this
        for (child in children) {
            child.findFirst(predicate)?.let { return it }
        }
        return null
    }

    private fun findCardTemplate(
        model: NShiftPluginModel,
    ): NShiftPluginModel? {
        if (model.name.rawValue == "Card") return model
        return model.children.firstNotNullOfOrNull(::findCardTemplate)
    }
}
