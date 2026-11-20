package com.nshiftui.poc.sdui.plugins.scn.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.nshiftui.poc.sdui.observers.LocalScreenRefresh
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginContainer
import com.nshiftui.NShiftSlotKey
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.ProvideSCNTheme
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNPresets
import com.nshiftui.poc.theme.SCNTheme
import com.nshiftui.poc.theme.SCNThemeId
import com.nshiftui.poc.ui.SCNIcon

@kotlinx.serialization.Serializable
data class ScreenNavigationBarMetadata(
    val title: String = "",
    val theme: String = "neutral",
    val leading: String = "auto",
    val leadingIcon: String = "",
    val trailing: String = "none",
    val trailingIcon: String = "",
    val background: String = "",
    val centerIcon: String = "",
) 

@kotlinx.serialization.Serializable
data class ScreenScrollMetadata(
    val enabled: Boolean = false,
    val fastRefresh: Boolean = false,
) 

@kotlinx.serialization.Serializable
data class ScreenMetadata(
    val navigationBar: ScreenNavigationBarMetadata? = null,
    val scroll: ScreenScrollMetadata? = null,
) : NShiftMetadata

enum class ScreenSlot(override val rawValue: String) : NShiftSlotKey {
    BottomSheet("bottomSheet"),
}

val LocalScreenBack = compositionLocalOf<(() -> Unit)?> { null }

@NShiftPlugin(
    name = "Screen",
    version = "1.0.0",
    metadata = ScreenMetadata::class,
    slots = ScreenSlot::class,
)
class ScreenPlugin : NShiftPluginContainer<ScreenViewModel>(
    name = "Screen",
    version = "1.0.0",
    metadata = ScreenMetadata::class,
    viewModelType = ScreenViewModel::class,
) {
    @Composable
    override fun Content() {
        val parent = LocalSCNTheme.current
        val screen = metadata<ScreenMetadata>()
        val navigationBar = screen.navigationBar ?: ScreenNavigationBarMetadata()
        val preset = SCNThemeId.values().firstOrNull {
            it.name.equals(navigationBar.theme, ignoreCase = true)
        } ?: SCNThemeId.Neutral
        ProvideSCNTheme(SCNTheme(SCNPresets.named(preset), parent.dark)) {
            ScreenScaffold(screen)
        }
    }

    @Composable
    private fun ScreenScaffold(screen: ScreenMetadata) {
        val theme = LocalSCNTheme.current
        val colors = theme.palette
        val fastRefresh = screen.scroll?.fastRefresh == true
        val scope = rememberCoroutineScope()
        var refreshing by remember { mutableStateOf(false) }
        val refresh = LocalScreenRefresh.current
        LaunchedEffect(refresh) {
            viewModel.bind(refresh)
        }
        Scaffold(
            containerColor = colors.background,
            topBar = { AndroidNavigationBar(screen) },
        ) { padding ->
            BoxWithConstraints(
                Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center,
            ) {
                val scrolling = screen.scroll?.enabled == true || fastRefresh
                val page: @Composable () -> Unit = {
                    if (scrolling) {
                        Column(
                            Modifier
                                .fillMaxSize()
                                .fillMaxWidth()
                                .heightIn(min = maxHeight)
                                .verticalScroll(rememberScrollState()),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                        ) {
                            children()
                        }
                    } else {
                        children()
                    }
                }
                if (fastRefresh) {
                    PullToRefreshBox(
                        isRefreshing = refreshing,
                        onRefresh = {
                            refreshing = true
                            scope.launch {
                                viewModel.refresh()
                                refreshing = false
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        page()
                    }
                } else {
                    page()
                }
                slots(ScreenSlot.BottomSheet)
            }
        }
    }
}

@Composable
private fun AndroidNavigationBar(screen: ScreenMetadata) {
    val theme = LocalSCNTheme.current
    val navigationBar = screen.navigationBar ?: ScreenNavigationBarMetadata()
    val onBack = LocalScreenBack.current
    val leading = leadingIcon(screen, onBack)
    val trailing = trailingIcon(screen)
    val container = barColor(navigationBar.background, theme)
    Column(
        Modifier
            .fillMaxWidth()
            .background(container)
            .statusBarsPadding(),
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 4.dp),
        ) {
            Row(
                Modifier.fillMaxSize(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (leading != null) {
                    BarButton(leading) {
                        if (navigationBar.leading != "button") onBack?.invoke()
                    }
                }
                if (navigationBar.centerIcon.isEmpty()) {
                    Text(
                        text = navigationBar.title,
                        modifier = Modifier.padding(start = if (leading == null) 12.dp else 0.dp),
                        color = theme.palette.foreground,
                        fontFamily = SCNFont,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Normal,
                        lineHeight = 28.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Spacer(Modifier.weight(1f))
                if (trailing != null) {
                    BarButton(trailing, onClick = {})
                }
            }
            if (navigationBar.centerIcon.isNotEmpty()) {
                Box(
                    Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    SCNIcon(
                        navigationBar.centerIcon,
                        size = 24.dp,
                        tint = theme.palette.foreground,
                    )
                }
            }
        }
    }
}

@Composable
private fun BarButton(icon: String, onClick: () -> Unit) {
    val tint = LocalSCNTheme.current.palette.foreground
    Box(
        Modifier
            .width(48.dp)
            .height(48.dp)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        SCNIcon(icon, size = 24.dp, tint = tint)
    }
}

private fun leadingIcon(screen: ScreenMetadata, onBack: (() -> Unit)?): String? {
    val navigationBar = screen.navigationBar ?: ScreenNavigationBarMetadata()
    if (navigationBar.leadingIcon.isNotBlank()) return navigationBar.leadingIcon
    return when (navigationBar.leading) {
        "none" -> null
        "back", "button" -> "arrow-left"
        else -> if (onBack != null) "arrow-left" else null
    }
}

private fun trailingIcon(screen: ScreenMetadata): String? {
    val navigationBar = screen.navigationBar ?: ScreenNavigationBarMetadata()
    if (navigationBar.trailingIcon.isNotBlank()) return navigationBar.trailingIcon
    return when (navigationBar.trailing) {
        "close", "button" -> "x"
        else -> null
    }
}

private fun barColor(token: String, theme: SCNTheme): Color {
    return when (token) {
        "card" -> theme.palette.card
        "primary" -> theme.palette.primary
        "muted" -> theme.palette.muted
        "secondary" -> theme.palette.secondary
        else -> theme.palette.background
    }
}
