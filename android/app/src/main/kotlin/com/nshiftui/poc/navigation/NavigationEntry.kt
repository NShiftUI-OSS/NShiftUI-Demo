package com.nshiftui.poc.navigation

import com.nshiftui.NShiftPluginModel
import com.nshiftui.poc.config.NShiftAppConfiguration
import java.util.UUID

data class NavigationEntry(
    val id: String = UUID.randomUUID().toString(),
    val deeplink: Deeplink,
    val preloadedModel: NShiftPluginModel? = null,
) {
    val screenName: String
        get() = deeplink.screenName

    val parameters: Map<String, String>
        get() = deeplink.parameters

    val screenURL: String
        get() = NShiftAppConfiguration.current.runtimeScreenURL(
            screenName = screenName,
            parameters = parameters,
        )
}
