package com.nshiftui.poc.sdui.plugins.scn.screen

import com.nshiftui.AnyNShiftMetadata
import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftEventName
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
import com.nshiftui.poc.sdui.events.scn.closebottomsheetevent.CloseBottomSheetEventMetadata
import com.nshiftui.poc.sdui.events.scn.openbottomsheetevent.OpenBottomSheetEventMetadata
import com.nshiftui.poc.sdui.plugins.scn.badge.BadgeMetadata
import com.nshiftui.poc.sdui.plugins.scn.sheet.SheetMetadata
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
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

@Serializable
private data class PokedexDetail(
    val id: Int,
    val name: String,
    val height: Int = 0,
    val weight: Int = 0,
    val types: List<PokedexTypeSlot> = emptyList(),
)

@Serializable
private data class PokedexTypeSlot(
    val slot: Int,
    val type: PokedexNamed,
)

@Serializable
private data class PokedexNamed(val name: String)

private data class PokedexPaginationState(
    val nextOffset: Int = 0,
    val isLoading: Boolean = false,
    val endReached: Boolean = false,
)

private val PokedexJson = Json { ignoreUnknownKeys = true }

private object PokedexCatalog {
    private val typeNames = mapOf(
        "normal" to "Normal", "fire" to "Fogo", "water" to "Água",
        "grass" to "Grama", "electric" to "Elétrico", "ice" to "Gelo",
        "fighting" to "Lutador", "poison" to "Veneno", "ground" to "Terrestre",
        "flying" to "Voador", "psychic" to "Psíquico", "bug" to "Inseto",
        "rock" to "Pedra", "ghost" to "Fantasma", "dragon" to "Dragão",
        "dark" to "Sombrio", "steel" to "Aço", "fairy" to "Fada",
    )

    fun typeName(raw: String): String =
        typeNames[raw] ?: raw.replaceFirstChar { it.uppercase() }

    fun number(id: Int): String = id.toString().padStart(3, '0')

    fun imageURL(id: Int): String =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/$id.png"

    fun measure(value: Int, unit: String): String =
        String.format(java.util.Locale("pt", "BR"), "%.1f %s", value / 10.0, unit)

    fun displayName(raw: String): String = raw.replaceFirstChar { it.uppercase() }

    fun sheetID(detail: PokedexDetail): String = "pokemon-${detail.id}-details"
}

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
    private val paginationMutex = Mutex()
    // Keyed by the container node instance: a reloaded tree builds new nodes,
    // so its pagination starts from the first page again.
    private val pokedexPagination = java.util.WeakHashMap<NShiftPluginNode, PokedexPaginationState>()
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

    /**
     * Loads the next PokeAPI page into the container [parentID].
     * The mutex is held for the whole cycle (offset read, request, append,
     * next offset update), so concurrent triggers are dropped, never queued.
     */
    suspend fun appendPokedexPage(
        engine: NShiftEngine?,
        parentID: String,
        endpoint: String,
        limit: Int,
    ): SendHTTPResponse {
        if (!paginationMutex.tryLock()) return SendHTTPResponse(status = 204, body = "")
        val tree = engine as? NShiftEngineTree
        val container = tree?.node(parentID)
        try {
            if (tree == null || container == null) {
                return SendHTTPResponse(status = 204, body = "")
            }
            val state = pokedexPagination[container] ?: PokedexPaginationState()
            if (state.isLoading || state.endReached) {
                return SendHTTPResponse(status = 204, body = "")
            }
            pokedexPagination[container] = state.copy(isLoading = true)

            val response = sendHTTPRequest(
                SendHTTPRequest(
                    method = "GET",
                    path = endpoint,
                    headers = emptyMap(),
                    query = mapOf(
                        "offset" to state.nextOffset.toString(),
                        "limit" to limit.coerceAtLeast(1).toString(),
                    ),
                    body = "",
                ),
            )
            if (response.status !in 200..299) return response
            val page = PokedexJson.decodeFromString<PokedexPageResponse>(response.body)
            val details = coroutineScope {
                page.results.map { result ->
                    async {
                        val detail = sendHTTPRequest(
                            SendHTTPRequest(
                                method = "GET",
                                path = result.url,
                                headers = emptyMap(),
                                query = emptyMap(),
                                body = "",
                            ),
                        )
                        PokedexJson.decodeFromString<PokedexDetail>(detail.body)
                    }
                }.awaitAll()
            }

            withContext(Dispatchers.Main) {
                appendPokedexCards(details, tree, parentID)
            }

            pokedexPagination[container] = PokedexPaginationState(
                nextOffset = state.nextOffset + page.results.size,
                endReached = page.next == null || page.results.isEmpty(),
            )
            return response
        } finally {
            if (container != null) {
                pokedexPagination[container]?.let {
                    pokedexPagination[container] = it.copy(isLoading = false)
                }
            }
            paginationMutex.unlock()
        }
    }

    private fun appendPokedexCards(
        details: List<PokedexDetail>,
        tree: NShiftEngineTree,
        parentID: String,
    ) {
        val parent = tree.node(parentID) ?: return
        val children = parent.model.children
        val template = children.firstOrNull(::isMultiTypeCard)
            ?: children.firstOrNull { it.name.rawValue == "Card" }
            ?: return
        val existing = children.mapNotNull(::pokedexNumber).toSet()
        val fresh = details.filter { PokedexCatalog.number(it.id) !in existing }
        if (fresh.isEmpty()) return

        val screen = tree.root
        val sheetSlot = ScreenSlot.BottomSheet.slotName
        val sheets = screen.model.slots[sheetSlot].orEmpty()
        sheets.firstOrNull { it.name.rawValue == "Sheet" }?.let { sheetTemplate ->
            tree.appendSlot(
                screen.renderId.rawValue,
                sheetSlot,
                fresh.map { makePokedexSheet(sheetTemplate, template, it) },
            )
        }

        // Insert only the new cards: existing card nodes keep their identity,
        // so their composed items are not rebuilt on every page.
        val cards = fresh.map { makePokedexCard(template, it) }
        val insertionIndex = children.indexOfLast { it.name.rawValue == "Card" }
            .let { if (it >= 0) it + 1 else children.size }
        tree.insertChildren(parent.renderId.rawValue, insertionIndex, cards)
    }

    private fun makePokedexCard(
        template: NShiftPluginModel,
        detail: PokedexDetail,
    ): NShiftPluginModel {
        var textIndex = 0
        val card = rewritePokedexModel(template, detail) { textIndex++ }
        return card.copy(
            events = card.events.map { event ->
                event.copy(
                    id = UUID.randomUUID().toString(),
                    name = NShiftEventName("OpenBottomSheetEvent"),
                    metadata = AnyNShiftMetadata(
                        OpenBottomSheetEventMetadata(
                            sheetID = PokedexCatalog.sheetID(detail),
                        ),
                    ),
                    events = emptyList(),
                )
            },
        )
    }

    private fun makePokedexSheet(
        template: NShiftPluginModel,
        card: NShiftPluginModel,
        detail: PokedexDetail,
    ): NShiftPluginModel {
        val number = PokedexCatalog.number(detail.id)
        val types = sortedTypes(detail).joinToString(" · ")
        val lines = listOf(
            "#$number · $types",
            "Altura ${PokedexCatalog.measure(detail.height, "m")} · Peso ${PokedexCatalog.measure(detail.weight, "kg")}",
        )
        var textIndex = 0
        val children = template.children.map { child ->
            when (child.name.rawValue) {
                "Text" -> {
                    val text = child.metadata?.unwrap<TextMetadata>()
                    if (text == null) {
                        child
                    } else {
                        val line = lines.getOrNull(textIndex++) ?: text.text
                        child.replacingMetadata(AnyNShiftMetadata(text.copy(text = line)))
                    }
                }
                "Button" -> child.replacingEvents(
                    child.events.map { event ->
                        event.copy(
                            id = UUID.randomUUID().toString(),
                            name = NShiftEventName("CloseBottomSheetEvent"),
                            metadata = AnyNShiftMetadata(
                                CloseBottomSheetEventMetadata(sheetID = PokedexCatalog.sheetID(detail)),
                            ),
                            events = emptyList(),
                        )
                    },
                )
                else -> child
            }
        }
        val avatar = card.firstModel("Avatar")?.let { model ->
            var index = 0
            rewritePokedexModel(model, detail) { index++ }
        }
        return template.copy(
            id = PokedexCatalog.sheetID(detail),
            metadata = AnyNShiftMetadata(SheetMetadata(title = PokedexCatalog.displayName(detail.name))),
            children = listOfNotNull(avatar) + children,
        )
    }

    private fun rewritePokedexModel(
        model: NShiftPluginModel,
        detail: PokedexDetail,
        nextTextIndex: () -> Int,
    ): NShiftPluginModel {
        val number = PokedexCatalog.number(detail.id)
        return when (model.name.rawValue) {
            "Avatar" -> {
                val avatar = model.metadata?.unwrap<AvatarMetadata>() ?: return model
                model.replacingMetadata(
                    AnyNShiftMetadata(
                        avatar.copy(
                            initials = number,
                            imageURL = PokedexCatalog.imageURL(detail.id),
                        ),
                    ),
                )
            }
            "Text" -> {
                val text = model.metadata?.unwrap<TextMetadata>() ?: return model
                val replacement = when (nextTextIndex()) {
                    0 -> PokedexCatalog.displayName(detail.name)
                    1 -> "#$number · PokeAPI"
                    else -> text.text
                }
                model.replacingMetadata(AnyNShiftMetadata(text.copy(text = replacement)))
            }
            "Badge" -> typeBadges(model, detail).firstOrNull() ?: model
            "HorizontalStack" -> if (isTypeStack(model)) {
                model.replacingChildren(typeBadges(model.children.first(), detail))
            } else {
                model.replacingChildren(model.children.map { rewritePokedexModel(it, detail, nextTextIndex) })
            }
            "Button" -> model.replacingEvents(
                model.events.map { event ->
                    event.copy(
                        id = UUID.randomUUID().toString(),
                        name = NShiftEventName("OpenBottomSheetEvent"),
                        metadata = AnyNShiftMetadata(
                            OpenBottomSheetEventMetadata(sheetID = PokedexCatalog.sheetID(detail)),
                        ),
                        events = emptyList(),
                    )
                },
            )
            else -> model.replacingChildren(model.children.map { rewritePokedexModel(it, detail, nextTextIndex) })
        }
    }

    private fun sortedTypes(detail: PokedexDetail): List<String> =
        detail.types.sortedBy { it.slot }.map { PokedexCatalog.typeName(it.type.name) }

    private fun typeBadges(
        badge: NShiftPluginModel,
        detail: PokedexDetail,
    ): List<NShiftPluginModel> =
        sortedTypes(detail).mapIndexed { index, type ->
            badge.replacingMetadata(
                AnyNShiftMetadata(
                    BadgeMetadata(text = type, variant = if (index == 0) "default" else "outline"),
                ),
            )
        }

    private fun isTypeStack(model: NShiftPluginModel): Boolean =
        model.name.rawValue == "HorizontalStack" &&
            model.children.isNotEmpty() &&
            model.children.all { it.name.rawValue == "Badge" }

    private fun isMultiTypeCard(model: NShiftPluginModel): Boolean {
        fun contains(node: NShiftPluginModel): Boolean =
            isTypeStack(node) || node.children.any(::contains)
        return model.name.rawValue == "Card" && contains(model)
    }

    private fun pokedexNumber(model: NShiftPluginModel): String? {
        if (model.name.rawValue != "Card") return null
        return model.firstModel("Avatar")?.metadata?.unwrap<AvatarMetadata>()?.initials
    }

    private fun NShiftPluginModel.firstModel(name: String): NShiftPluginModel? {
        if (this.name.rawValue == name) return this
        return children.firstNotNullOfOrNull { it.firstModel(name) }
    }
}
