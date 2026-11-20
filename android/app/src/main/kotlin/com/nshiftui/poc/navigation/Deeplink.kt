package com.nshiftui.poc.navigation

import java.net.URI
import java.net.URLDecoder

data class Deeplink(
    val screenName: String,
    val parameters: Map<String, String>,
    val raw: String,
) {
    companion object {
        const val home = "nshift://screen/home"

        fun parse(text: String): Deeplink? {
            val uri = try {
                URI(text)
            } catch (_: Exception) {
                return null
            }
            if (uri.scheme != "nshift" || uri.host != "screen") {
                return null
            }
            val segments = uri.path
                .split("/")
                .filter { it.isNotEmpty() }
            val screenName = segments.singleOrNull()?.takeIf { it.isNotEmpty() } ?: return null
            return Deeplink(
                screenName = screenName,
                parameters = parameters(uri.rawQuery),
                raw = text,
            )
        }

        private fun parameters(query: String?): Map<String, String> {
            if (query.isNullOrEmpty()) {
                return emptyMap()
            }
            val values = linkedMapOf<String, String>()
            query.split("&").forEach { pair ->
                if (pair.isEmpty()) {
                    return@forEach
                }
                val parts = pair.split("=", limit = 2)
                val name = decode(parts[0])
                if (name.isEmpty() || values.containsKey(name)) {
                    return@forEach
                }
                val value = parts.getOrNull(1)?.let(::decode) ?: ""
                values[name] = value
            }
            return values
        }

        private fun decode(text: String): String =
            URLDecoder.decode(text, "UTF-8")
    }
}
