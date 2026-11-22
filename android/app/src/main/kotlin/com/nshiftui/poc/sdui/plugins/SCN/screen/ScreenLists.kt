package com.nshiftui.poc.sdui.plugins.scn.screen

import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftRainbowCompiler
import com.nshiftui.poc.sdui.events.scn.updatelistevent.UpdateListEventMetadata
import com.nshiftui.poc.sdui.plugins.primitive.foreach.ForEachMetadata
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.doubleOrNull

/**
 * Reads values out of JSON with dot paths such as `results`,
 * `sprites.other.official-artwork.front_default` or `types.0.type.name`.
 */
object JSONPath {
    fun value(root: Any?, path: String): Any? {
        if (path.isEmpty()) return root
        var current = root
        for (key in path.split('.')) {
            current = when (current) {
                is JsonObject -> current[key]
                is Map<*, *> -> current[key]
                is JsonArray -> key.toIntOrNull()?.let { current.getOrNull(it) }
                is List<*> -> key.toIntOrNull()?.let { current.getOrNull(it) }
                else -> null
            } ?: return null
        }
        return current
    }

    fun string(value: Any?): String? = when (value) {
        null, JsonNull -> null
        is JsonPrimitive -> value.content
        is String -> value
        is Number, is Boolean -> value.toString()
        else -> null
    }

    fun number(value: Any?): Double? = when (value) {
        is JsonPrimitive -> value.doubleOrNull
        is Number -> value.toDouble()
        is String -> value.toDoubleOrNull()
        else -> null
    }

    fun list(value: Any?): List<Any?>? = when (value) {
        is JsonArray -> value
        is List<*> -> value
        else -> null
    }
}

/**
 * `{{ expression }}` placeholders: a JSON path plus optional filters, e.g.
 * `{{name|capitalize}}`, `{{id|pad:3}}`, `{{types|map:type.name|join: · }}`,
 * `{{url|last}}`, `{{x|default:-}}`, `{{height|divide:10|number:1}}`.
 */
object RainbowTemplate {
    /** Fills a URL: values are percent-encoded so user input cannot break it. */
    fun renderURL(template: String, context: Map<String, Any?>): String =
        render(template, context) { java.net.URLEncoder.encode(it, "UTF-8").replace("+", "%20") }

    fun render(template: String, context: Map<String, Any?>, escaping: Boolean): String =
        render(template, context) { if (escaping) escape(it) else it }

    private fun render(template: String, context: Map<String, Any?>, transform: (String) -> String): String {
        val output = StringBuilder()
        var index = 0
        while (true) {
            val open = template.indexOf("{{", index)
            if (open < 0) break
            val close = template.indexOf("}}", open + 2)
            if (close < 0) break
            output.append(template, index, open)
            val value = evaluate(template.substring(open + 2, close), context)
            output.append(transform(value))
            index = close + 2
        }
        output.append(template.substring(index))
        return output.toString()
    }

    fun evaluate(expression: String, context: Map<String, Any?>): String {
        val parts = expression.split('|')
        var value: Any? = JSONPath.value(context, parts.first().trim())
        for (filter in parts.drop(1)) {
            val colon = filter.indexOf(':')
            val name = (if (colon >= 0) filter.substring(0, colon) else filter).trim()
            val argument = if (colon >= 0) filter.substring(colon + 1) else null
            value = apply(name, argument, value)
        }
        JSONPath.list(value)?.let { list -> return list.mapNotNull(JSONPath::string).joinToString(", ") }
        return JSONPath.string(value) ?: ""
    }

    private fun apply(filter: String, argument: String?, value: Any?): Any? = when (filter) {
        "map" -> JSONPath.list(value)?.mapNotNull { JSONPath.value(it, argument.orEmpty()) } ?: value
        "join" -> JSONPath.list(value)?.mapNotNull(JSONPath::string)?.joinToString(argument ?: ", ") ?: value
        "first" -> JSONPath.list(value)?.firstOrNull()
        "capitalize" -> JSONPath.string(value)?.replaceFirstChar { it.uppercase() } ?: value
        "upper" -> JSONPath.string(value)?.uppercase()
        "lower" -> JSONPath.string(value)?.lowercase()
        "pad" -> JSONPath.string(value)?.padStart(argument?.trim()?.toIntOrNull() ?: 0, '0') ?: value
        "number" -> JSONPath.number(value)?.let {
            String.format(java.util.Locale.US, "%.${argument?.trim()?.toIntOrNull() ?: 2}f", it)
        } ?: value
        "divide" -> {
            val number = JSONPath.number(value)
            val divisor = argument?.trim()?.toDoubleOrNull()
            if (number != null && divisor != null && divisor != 0.0) number / divisor else value
        }
        "last" -> JSONPath.string(value)?.split('/')?.lastOrNull { it.isNotEmpty() } ?: value
        "default" -> if (JSONPath.string(value).isNullOrEmpty()) argument.orEmpty() else value
        else -> value
    }

    private fun escape(value: String): String =
        value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
}

/**
 * Generic list runtime of a screen. `UpdateListEvent` loads JSON pages into a
 * list id; every `ForEach(source:)` bound to that id renders its template once
 * per item. Nothing here knows what the data or the cards are.
 */
class ScreenLists {
    private data class State(
        val nextOffset: Int = 0,
        val nextURL: String? = null,
        val endReached: Boolean = false,
        val itemCount: Int = 0,
    )

    private data class AddedItem(val id: String, val filter: ForEachMetadata)

    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()
    private val states = mutableMapOf<String, State>()
    private val filterValues = java.util.concurrent.ConcurrentHashMap<String, String>()
    private val searchValues = java.util.concurrent.ConcurrentHashMap<String, String>()

    /** One request cycle at a time: concurrent triggers are dropped, never queued. */
    suspend fun update(
        request: UpdateListEventMetadata,
        tree: NShiftEngineTree,
        screen: ScreenViewModel,
    ): SendHTTPResponse {
        if (!mutex.tryLock()) return SendHTTPResponse(status = 204, body = "")
        try {
            val listID = request.listID
            val replacing = request.mode == "replace"
            var state = if (replacing) State() else states[listID] ?: State()
            if (!replacing && state.endReached) return SendHTTPResponse(status = 204, body = "")
            val context = screen.templateContext()
            var response = SendHTTPResponse(status = 204, body = "")
            var replaceNext = replacing
            repeat(request.maxPages.coerceAtLeast(1)) {
                val query = mutableMapOf<String, String>()
                val url = state.nextURL.takeIf { !replaceNext } ?: run {
                    if (request.pageSize > 0) {
                        query[request.offsetParameter] = state.nextOffset.toString()
                        query[request.limitParameter] = request.pageSize.toString()
                    }
                    RainbowTemplate.renderURL(request.url, context)
                }
                response = screen.sendHTTPRequest(
                    SendHTTPRequest(method = "GET", path = url, headers = request.headers, query = query, body = ""),
                )
                if (response.status !in 200..299) return response
                val root = json.parseToJsonElement(response.body)
                var items = items(JSONPath.value(root, request.itemsPath))
                if (request.expandPath.isNotEmpty()) items = expand(items, request.expandPath, screen)
                val added = withContext(Dispatchers.Main) {
                    materialize(items, listID, if (replaceNext) 0 else state.itemCount, replaceNext, tree, context)
                }
                replaceNext = false
                val nextOffset = state.nextOffset + items.size
                state = when {
                    request.nextPath.isNotEmpty() -> {
                        val next = JSONPath.string(JSONPath.value(root, request.nextPath))
                        state.copy(nextOffset = nextOffset, nextURL = next, endReached = next == null || items.isEmpty())
                    }
                    request.pageSize > 0 -> {
                        val total = JSONPath.number(JSONPath.value(root, request.totalPath))
                        state.copy(
                            nextOffset = nextOffset,
                            endReached = items.isEmpty() || (total != null && nextOffset >= total),
                        )
                    }
                    else -> state.copy(nextOffset = nextOffset, endReached = true)
                }.copy(itemCount = state.itemCount + items.size)
                states[listID] = state
                // With a ForEach filter active a page may add nothing visible:
                // keep loading (one request at a time) up to `maxPages`.
                val showsSomething = added.any { isVisible(it.id, it.filter, screen.inputs.value) }
                if (state.endReached || showsSomething || added.isEmpty()) return response
            }
            return response
        } finally {
            mutex.unlock()
        }
    }

    private fun items(value: Any?): List<JsonElement> = when (value) {
        is JsonArray -> value
        is JsonElement -> listOf(value)
        else -> emptyList()
    }

    /** Replaces each item with the object at its `path` URL, keeping its own extra fields. */
    private suspend fun expand(items: List<JsonElement>, path: String, screen: ScreenViewModel): List<JsonElement> =
        items.map { item ->
            val url = JSONPath.string(JSONPath.value(item, path)) ?: return@map item
            val response = screen.sendHTTPRequest(
                SendHTTPRequest(method = "GET", path = url, headers = emptyMap(), query = emptyMap(), body = ""),
            )
            val fetched = runCatching { json.parseToJsonElement(response.body) as? JsonObject }.getOrNull()
            if (response.status !in 200..299 || fetched == null) return@map item
            val original = item as? JsonObject ?: return@map fetched
            JsonObject(original + fetched)
        }

    /** Compiles each `ForEach` template bound to [listID] per item; only new nodes are added. */
    private fun materialize(
        items: List<JsonElement>,
        listID: String,
        startIndex: Int,
        replacing: Boolean,
        tree: NShiftEngineTree,
        context: Map<String, Any?>,
    ): List<AddedItem> {
        val added = mutableListOf<AddedItem>()
        for (node in forEachNodes(listID, tree.root)) {
            val metadata = node.model.metadata?.unwrap<ForEachMetadata>() ?: continue
            val models = mutableListOf<NShiftPluginModel>()
            items.forEachIndexed { offset, item ->
                val index = startIndex + offset
                val itemContext = context.toMutableMap()
                (item as? JsonObject)?.forEach { (key, value) -> itemContext[key] = value }
                itemContext["item"] = item
                itemContext["index"] = index
                val source = RainbowTemplate.render(metadata.template, itemContext, escaping = true)
                val compiled = runCatching { NShiftRainbowCompiler().compileAll(source) }.getOrNull() ?: return@forEachIndexed
                compiled.forEachIndexed { position, model ->
                    val id = if (compiled.size == 1) "$listID#$index" else "$listID#$index.$position"
                    models += model.copy(id = id)
                    if (metadata.filterPath.isNotEmpty()) {
                        filterValues[id] = JSONPath.string(JSONPath.value(item, metadata.filterPath)).orEmpty()
                    }
                    if (metadata.searchPath.isNotEmpty()) {
                        searchValues[id] = JSONPath.string(JSONPath.value(item, metadata.searchPath)).orEmpty()
                    }
                    added += AddedItem(id, metadata)
                }
            }
            if (replacing) {
                tree.replaceChildren(node.renderId.rawValue, models)
            } else if (models.isNotEmpty()) {
                tree.insertChildren(node.renderId.rawValue, node.children.size, models)
            }
        }
        return added
    }

    private fun forEachNodes(listID: String, node: NShiftPluginNode): List<NShiftPluginNode> {
        val found = mutableListOf<NShiftPluginNode>()
        if (node.model.name.rawValue == "ForEach" && node.model.metadata?.unwrap<ForEachMetadata>()?.source == listID) {
            found += node
        }
        node.children.forEach { found += forEachNodes(listID, it) }
        node.slotChildren.values.flatten().forEach { found += forEachNodes(listID, it) }
        return found
    }

    /** Whether a generated item passes its `ForEach` filter for the current input value. */
    fun isVisible(itemID: String?, filter: ForEachMetadata, inputs: List<ScreenInput>): Boolean {
        if (itemID == null) return true
        if (filter.filterInput.isNotEmpty()) {
            val selection = inputs.firstOrNull { it.id == filter.filterInput }?.value.orEmpty()
            val showsAll = selection.isEmpty() || selection.equals(filter.filterAll, ignoreCase = true)
            if (!showsAll && filterValues[itemID]?.equals(selection, ignoreCase = true) != true) return false
        }
        if (filter.searchInput.isNotEmpty()) {
            val query = inputs.firstOrNull { it.id == filter.searchInput }?.value.orEmpty().trim()
            if (query.isNotEmpty() && !searchValues[itemID].orEmpty().contains(query, ignoreCase = true)) return false
        }
        return true
    }
}
