package com.nshiftui.poc.config

import java.net.URLEncoder

enum class NShiftAppEnvironment {
    PRD,
    DEV,
    LOCAL,
    ;

    val backendBaseURL: String
        get() {
            // The Android emulator reaches the host machine through 10.0.2.2.
            // DEV and PRD intentionally point to LOCAL until provisioned.
            return "https://10.0.2.2:3000"
        }
}

data class NShiftAppConfiguration(
    val environment: NShiftAppEnvironment,
    val backendBaseURL: String = environment.backendBaseURL,
    val initialScreenName: String = "home",
) {
    companion object {
        val current = NShiftAppConfiguration(NShiftAppEnvironment.LOCAL)
    }

    val initialScreenURL: String
        get() = runtimeScreenURL(initialScreenName)

    fun runtimeScreenURL(
        screenName: String,
        parameters: Map<String, String> = emptyMap(),
    ): String {
        val encodedName = URLEncoder.encode(screenName, "UTF-8")
        if (parameters.isEmpty()) {
            return "/runtime/screens/$encodedName"
        }
        val query = parameters.toSortedMap().entries.joinToString("&") { (key, value) ->
            "${encode(key)}=${encode(value)}"
        }
        return "/runtime/screens/$encodedName?$query"
    }

    private fun encode(value: String): String =
        URLEncoder.encode(value, "UTF-8")
}
