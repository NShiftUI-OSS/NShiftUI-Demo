package com.nshiftui.poc.sdui.plugins.scn.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.foundation.interaction.collectIsDraggedAsState
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import androidx.compose.runtime.setValue
import com.nshiftui.poc.sdui.observers.LocalScreenRefresh
import com.nshiftui.poc.sdui.plugins.primitive.StackLayoutMetadata
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onScrollEndReached
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.distinctUntilChanged
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginNode
import com.nshiftui.NShiftNodeView
import com.nshiftui.NShiftTrigger
import com.nshiftui.NShiftPluginContainer
import com.nshiftui.AnyNShiftMetadata
import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftRainbowMetadataDecodeResult
import com.nshiftui.NShiftRainbowMetadataDecodingContext
import com.nshiftui.NShiftRainbowPluginMetadata
import com.nshiftui.NShiftSlotKey
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNFont
import com.nshiftui.poc.theme.SCNTheme
import com.nshiftui.poc.sdui.plugins.scn.tabbar.LocalTabBarHosted
import com.nshiftui.poc.sdui.plugins.scn.tabbar.LocalTabChromeReport
import com.nshiftui.poc.sdui.plugins.scn.tabbar.TabRouteScreen
import com.nshiftui.poc.sdui.plugins.scn.tabbar.tabBarItems
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
    val isLazy: Boolean = false,
    val fastRefresh: Boolean = false,
    @kotlinx.serialization.Transient
    val header: List<NShiftPluginModel> = emptyList(),
    @kotlinx.serialization.Transient
    val footer: List<NShiftPluginModel> = emptyList(),
)

@kotlinx.serialization.Serializable
data class ScreenMetadata(
    val navigationBar: ScreenNavigationBarMetadata? = null,
    val scroll: ScreenScrollMetadata? = null,
) : NShiftMetadata, NShiftRainbowPluginMetadata {
    override fun decodeRainbowMetadata(
        context: NShiftRainbowMetadataDecodingContext,
    ): NShiftRainbowMetadataDecodeResult {
        val slots = buildMap {
            context.compilePlugins("scroll.header")
                .takeIf { it.isNotEmpty() }
                ?.let { put(ScreenSlot.ScrollHeader.slotName, it) }
            context.compilePlugins("scroll.footer")
                .takeIf { it.isNotEmpty() }
                ?.let { put(ScreenSlot.ScrollFooter.slotName, it) }
        }
        return NShiftRainbowMetadataDecodeResult(
            metadata = AnyNShiftMetadata(
                copy(
                    scroll = scroll?.copy(
                        header = context.compilePlugins("scroll.header"),
                        footer = context.compilePlugins("scroll.footer"),
                    ),
                ),
            ),
            slots = slots,
        )
    }
}

enum class ScreenSlot(override val rawValue: String) : NShiftSlotKey {
    BottomSheet("bottomSheet"),
    TabBar("tabBar"),
    ScrollHeader("ScrollHeader"),
    ScrollFooter("ScrollFooter"),
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
        val screen = metadata<ScreenMetadata>()
        val scope = rememberCoroutineScope()
        viewModel.bindEngine(engine)
        val hosted = LocalTabBarHosted.current
        val slotTabs = tabBarItems(model.slots[ScreenSlot.TabBar.slotName].orEmpty(), hosted)
        val tabs = if (slotTabs.isNotEmpty()) slotTabs else tabBarItems(model.children, hosted)
        var selected by remember { mutableStateOf(0) }
        var chromeByRoute by remember { mutableStateOf<Map<String, ScreenNavigationBarMetadata>>(emptyMap()) }
        val ownerBar = screen.navigationBar ?: ScreenNavigationBarMetadata()
        val activeBar = if (!hosted && selected > 0) {
            val tab = tabs.getOrNull(selected)
            val route = tab?.route
            when {
                route != null && chromeByRoute.containsKey(route) -> chromeByRoute.getValue(route)
                else -> ScreenNavigationBarMetadata(
                    title = tab?.title.orEmpty(),
                    theme = ownerBar.theme,
                )
            }
        } else {
            ownerBar
        }
        val report = LocalTabChromeReport.current
        LaunchedEffect(ownerBar) {
            report?.invoke(ownerBar)
        }
        ScreenScaffold(
            screen = screen,
            tabs = tabs,
            selected = selected,
            onSelect = { selected = it },
            bar = activeBar,
            hosted = hosted,
            onChrome = { route, chrome ->
                if (chromeByRoute[route] != chrome) {
                    chromeByRoute = chromeByRoute + (route to chrome)
                }
            },
            onScrollEnd = {
                fire(NShiftTrigger.onScrollEndReached, scope)
            },
        )
    }

    @Composable
    private fun ScreenScaffold(
        screen: ScreenMetadata,
        tabs: List<com.nshiftui.poc.sdui.plugins.scn.tabbar.TabMetadata>,
        selected: Int,
        onSelect: (Int) -> Unit,
        bar: ScreenNavigationBarMetadata,
        hosted: Boolean,
        onChrome: (String, ScreenNavigationBarMetadata) -> Unit,
        onScrollEnd: () -> Unit,
    ) {
        val theme = LocalSCNTheme.current
        val colors = theme.palette
        val scope = rememberCoroutineScope()
        var refreshing by remember { mutableStateOf(false) }
        val refresh = LocalScreenRefresh.current
        LaunchedEffect(refresh) {
            viewModel.bind(refresh)
        }
        if (hosted) {
            ScreenPage(
                screen = screen,
                tabs = tabs,
                selected = selected,
                refreshing = refreshing,
                onRefresh = {
                    refreshing = true
                    scope.launch {
                        viewModel.refresh()
                        refreshing = false
                    }
                },
                onChrome = onChrome,
                onScrollEnd = onScrollEnd,
                    modifier = Modifier
                    .fillMaxSize()
                    .background(colors.background),
            )
            return
        }
        Scaffold(
            containerColor = colors.background,
            topBar = {
                val outerBack = LocalScreenBack.current
                val back: (() -> Unit)? = if (selected > 0) {
                    { onSelect(0) }
                } else {
                    outerBack
                }
                CompositionLocalProvider(LocalScreenBack provides back) {
                    AndroidNavigationBar(bar)
                }
            },
            bottomBar = {
                if (tabs.size > 1) {
                    NavigationBar(containerColor = colors.background) {
                        tabs.forEachIndexed { index, tab ->
                            NavigationBarItem(
                                selected = selected == index,
                                onClick = { onSelect(index) },
                                icon = {
                                    if (tab.icon.isNotBlank()) {
                                        SCNIcon(
                                            name = tab.icon,
                                            tint = if (selected == index) colors.primary else colors.mutedForeground,
                                        )
                                    }
                                },
                                label = {
                                    Text(tab.title, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = colors.primary,
                                    selectedTextColor = colors.primary,
                                    unselectedIconColor = colors.mutedForeground,
                                    unselectedTextColor = colors.mutedForeground,
                                    indicatorColor = colors.muted,
                                ),
                            )
                        }
                    }
                }
            },
        ) { padding ->
            ScreenPage(
                screen = screen,
                tabs = tabs,
                selected = selected,
                refreshing = refreshing,
                onRefresh = {
                    refreshing = true
                    scope.launch {
                        viewModel.refresh()
                        refreshing = false
                    }
                },
                onChrome = onChrome,
                onScrollEnd = onScrollEnd,
                    modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            )
        }
    }

    @Composable
    private fun ScreenPage(
        screen: ScreenMetadata,
        tabs: List<com.nshiftui.poc.sdui.plugins.scn.tabbar.TabMetadata>,
        selected: Int,
        refreshing: Boolean,
        onRefresh: () -> Unit,
        onChrome: (String, ScreenNavigationBarMetadata) -> Unit,
        onScrollEnd: () -> Unit,
        modifier: Modifier,
    ) {
        val fastRefresh = screen.scroll?.fastRefresh == true
        val isLazy = screen.scroll?.isLazy == true
        val lazyListState = rememberLazyListState()
        val scrollState = rememberScrollState()
        val currentOnScrollEnd by rememberUpdatedState(onScrollEnd)
        val lazyDragged = lazyListState.interactionSource.collectIsDraggedAsState()
        val columnDragged = scrollState.interactionSource.collectIsDraggedAsState()
        if (isLazy) {
            LaunchedEffect(lazyListState) {
                watchScrollEnd(
                    { lazyListState.canScrollForward to lazyDragged.value },
                    { currentOnScrollEnd() },
                )
            }
        } else if (screen.scroll?.enabled == true || fastRefresh) {
            LaunchedEffect(scrollState) {
                watchScrollEnd(
                    { (scrollState.canScrollForward || scrollState.maxValue == 0) to columnDragged.value },
                    { currentOnScrollEnd() },
                )
            }
        }
        BoxWithConstraints(
            modifier,
            contentAlignment = Alignment.TopCenter,
        ) {
                val scrolling = screen.scroll?.enabled == true || fastRefresh || isLazy
                val page: @Composable () -> Unit = @Composable {
                    if (isLazy) {
                        // A single root VerticalStack is expanded into one lazy item per
                        // child, so appended cards are composed on their own and existing
                        // items are kept.
                        val stack = lazyRootStack()
                        val stackLayout = stack?.model?.metadata?.unwrap<StackLayoutMetadata>()
                        val itemNodes = stack?.children ?: screenChildrenNodes()
                        LazyColumn(
                            Modifier
                                .fillMaxSize()
                                .fillMaxWidth(),
                            state = lazyListState,
                            contentPadding = PaddingValues(
                                top = 16.dp,
                                start = 16.dp,
                                end = 16.dp,
                                bottom = 16.dp,
                            ),
                            horizontalAlignment = stackLayout?.horizontalAlignment()
                                ?: Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(
                                (stackLayout?.spacing ?: 12.0).dp,
                            ),
                        ) {
                            lazySlotItems(ScreenSlot.ScrollHeader)
                            items(
                                itemNodes,
                                key = { node -> node.renderId.rawValue },
                            ) { node ->
                                NShiftNodeView(
                                    node = node,
                                    engine = requireEngineTree(),
                                    viewModel = parentViewModel(),
                                )
                            }
                            lazySlotItems(ScreenSlot.ScrollFooter)
                        }
                    } else if (scrolling) {
                        Column(
                            Modifier
                                .fillMaxSize()
                                .fillMaxWidth()
                                .heightIn(min = maxHeight)
                                .verticalScroll(scrollState),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Top,
                        ) {
                            Column(
                                Modifier
                                    .fillMaxWidth()
                                    .padding(
                                        top = 16.dp,
                                        start = 16.dp,
                                        end = 16.dp,
                                    ),
                            ) {
                                scrollChildren()
                            }
                        }
                    } else {
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .padding(
                                    top = 16.dp,
                                    start = 16.dp,
                                    end = 16.dp,
                                ),
                        ) {
                            screenChildren()
                        }
                    }
                }
                if (tabs.isNotEmpty() && selected > 0) {
                    val route = tabs[selected].route
                    androidx.compose.runtime.key(route) {
                        TabRouteScreen(route) { chrome -> onChrome(route, chrome) }
                    }
                } else if (fastRefresh) {
                    PullToRefreshBox(
                        isRefreshing = refreshing,
                        onRefresh = onRefresh,
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

    @Composable
    private fun screenChildren() {
        children { model, node ->
            if (model.name.rawValue != "TabBar") {
                NShiftNodeView(node = node, engine = requireEngineTree(), viewModel = parentViewModel())
            }
        }
    }

    @Composable
    private fun scrollChildren() {
        slots(ScreenSlot.ScrollHeader)
        screenChildren()
        slots(ScreenSlot.ScrollFooter)
    }

    private fun lazyRootStack(): NShiftPluginNode? {
        val content = screenChildrenNodes()
        val stack = content.singleOrNull() ?: return null
        if (stack.model.name.rawValue != "VerticalStack") return null
        return stack.takeIf { it.model.metadata?.unwrap<StackLayoutMetadata>() != null }
    }

    private fun screenChildrenNodes(): List<NShiftPluginNode> =
        requireEngineTree()
            .node(renderID)
            ?.children
            .orEmpty()
            .filter { it.model.name.rawValue != "TabBar" }

    private fun LazyListScope.lazySlotItems(slot: ScreenSlot) {
        val nodes = requireEngineTree()
            .node(renderID)
            ?.slotChildren
            ?.get(slot.slotName)
            .orEmpty()
        items(
            nodes,
            key = { node -> node.renderId.rawValue },
        ) { node ->
            NShiftNodeView(
                node = node,
                engine = requireEngineTree(),
                viewModel = parentViewModel(),
            )
        }
    }
}

@Composable
private fun AndroidNavigationBar(navigationBar: ScreenNavigationBarMetadata) {
    val theme = LocalSCNTheme.current
    val onBack = LocalScreenBack.current
    val leading = leadingIcon(navigationBar, onBack)
    val trailing = trailingIcon(navigationBar)
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

private fun leadingIcon(navigationBar: ScreenNavigationBarMetadata, onBack: (() -> Unit)?): String? {
    if (navigationBar.leadingIcon.isNotBlank()) return navigationBar.leadingIcon
    return when (navigationBar.leading) {
        "none" -> null
        "back", "button" -> "arrow-left"
        else -> if (onBack != null) "arrow-left" else null
    }
}

private fun trailingIcon(navigationBar: ScreenNavigationBarMetadata): String? {
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

/**
 * Fires once per user gesture that reaches the end. Only the start of a new drag
 * arms it, so appended content or fling momentum never fire it again by themselves.
 */
private suspend fun watchScrollEnd(
    state: () -> Pair<Boolean, Boolean>,
    onReached: () -> Unit,
) {
    var armed = false
    var wasDragging = false
    snapshotFlow(state)
        .distinctUntilChanged()
        .collect { (canScrollForward, dragging) ->
            if (dragging && !wasDragging) armed = true
            wasDragging = dragging
            if (!canScrollForward && armed) {
                armed = false
                onReached()
            }
        }
}
