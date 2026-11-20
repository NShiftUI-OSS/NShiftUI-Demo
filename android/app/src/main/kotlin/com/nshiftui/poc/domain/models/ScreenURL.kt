package com.nshiftui.poc.domain.models

class ScreenURL(
    val path: String,
    val query: Map<String, String>,
) {
    companion object {
        operator fun invoke(text: String): ScreenURL? {
            val pieces = text.split("?", limit = 2)
            val path = pieces[0]
            if (path.isEmpty()) {
                return null
            }
            if (pieces.size == 1) {
                return ScreenURL(path, emptyMap())
            }
            val query = linkedMapOf<String, String>()
            pieces[1].split("&").forEach { pair ->
                if (pair.isEmpty()) {
                    return@forEach
                }
                val parts = pair.split("=", limit = 2)
                val name = parts[0]
                if (name.isEmpty() || query.containsKey(name)) {
                    return@forEach
                }
                query[name] = parts.getOrNull(1).orEmpty()
            }
            return ScreenURL(path, query)
        }
    }
}
