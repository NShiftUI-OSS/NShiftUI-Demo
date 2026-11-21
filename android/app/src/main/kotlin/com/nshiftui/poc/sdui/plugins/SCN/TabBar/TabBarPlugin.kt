package com.nshiftui.poc.sdui.plugins.scn.tabbar

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.config.NShiftAppConfiguration
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenNavigationBarMetadata
import com.nshiftui.poc.sdui.plugandplay.Screen
import kotlinx.serialization.Serializable

@Serializable
data class TabMetadata(
    val title: String = "",
    val icon: String = "",
    val route: String = "",
) : NShiftMetadata

@NShiftPlugin(
    name = "Tab",
    version = "1.0.0",
    metadata = TabMetadata::class,
)
class TabPlugin : NShiftPluginWithMetadata<TabMetadata>(
    "Tab",
    "1.0.0",
    TabMetadata::class,
) {
    @Composable
    override fun Content() {
    }
}

@NShiftPlugin(
    name = "TabBar",
    version = "1.0.0",
)
class TabBarPlugin : NShiftPluginWithViewModel(
    "TabBar",
    "1.0.0",
) {
    @Composable
    override fun Content() {
    }
}

val LocalTabBarHosted = compositionLocalOf { false }

val LocalTabChromeReport = compositionLocalOf<((ScreenNavigationBarMetadata) -> Unit)?> { null }

fun tabBarItems(children: List<NShiftPluginModel>, hosted: Boolean): List<TabMetadata> {
    if (hosted) return emptyList()
    val bar = children.firstOrNull { it.name.rawValue == "TabBar" } ?: return emptyList()
    return bar.children.mapNotNull { child ->
        child.metadata?.unwrap(TabMetadata::class.java)?.let { tab ->
            tab.copy(route = tab.route.removePrefix("."))
        }
    }
}

@Composable
fun TabRouteScreen(
    route: String,
    onChrome: (ScreenNavigationBarMetadata) -> Unit,
) {
    val name = route.trim().removePrefix(".")
    if (name.isEmpty()) {
        Box(Modifier.fillMaxSize())
        return
    }
    val screen = Screen()
        .url(NShiftAppConfiguration.current.runtimeScreenURL(name))
        .title(name)
    androidx.compose.runtime.CompositionLocalProvider(
        LocalTabBarHosted provides true,
        LocalTabChromeReport provides onChrome,
    ) {
        screen.resolve()
    }
}
