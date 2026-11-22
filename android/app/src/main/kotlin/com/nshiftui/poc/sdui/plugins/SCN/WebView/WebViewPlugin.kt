package com.nshiftui.poc.sdui.plugins.scn.webview

import android.graphics.Bitmap
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.viewinterop.AndroidView
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginContainer
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.plugandplay.LocalScreenRouteParameters
import com.nshiftui.poc.sdui.plugins.scn.screen.AndroidNavigationBar
import com.nshiftui.poc.sdui.plugins.scn.screen.RainbowTemplate
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenNavigationBarMetadata
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.plugins.scn.tabbar.LocalTabBarHosted
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.components.SCNButton
import com.nshiftui.poc.ui.components.SCNButtonVariant
import com.nshiftui.poc.ui.components.SCNSpinner
import com.nshiftui.poc.ui.components.SCNText
import com.nshiftui.poc.ui.components.SCNTextColor
import com.nshiftui.poc.ui.components.SCNTextStyle

@kotlinx.serialization.Serializable
data class WebViewMetadata(
    val navigationBar: ScreenNavigationBarMetadata? = null,
    /** Page to show; accepts `{{route.x}}` placeholders. */
    val url: String = "",
) : NShiftMetadata

private enum class PagePhase { Loading, Loaded, Failed }

/**
 * `WebView(navigationBar:, url:)`: a root container like `Screen` whose content is a
 * web page, under the design-system navigation bar.
 */
@NShiftPlugin(
    name = "WebView",
    version = "1.0.0",
    metadata = WebViewMetadata::class,
)
class WebViewPlugin : NShiftPluginContainer<ScreenViewModel>(
    name = "WebView",
    version = "1.0.0",
    metadata = WebViewMetadata::class,
    viewModelType = ScreenViewModel::class,
) {
    @Composable
    override fun Content() {
        val web = metadata<WebViewMetadata>()
        val routeParameters = LocalScreenRouteParameters.current
        viewModel.bindEngine(engine)
        viewModel.bindRouteParameters(routeParameters)
        val colors = LocalSCNTheme.current.palette
        val hosted = LocalTabBarHosted.current
        val url = RainbowTemplate.renderURL(web.url, mapOf("route" to routeParameters))
            .takeIf { it.startsWith("https://") || it.startsWith("http://") }
        var phase by remember(url) { mutableStateOf(PagePhase.Loading) }
        var webView by remember { mutableStateOf<WebView?>(null) }
        var canGoBack by remember { mutableStateOf(false) }
        // System back walks the page history first, then leaves the screen.
        BackHandler(enabled = canGoBack) { webView?.goBack() }
        Scaffold(
            containerColor = colors.background,
            topBar = { if (!hosted) AndroidNavigationBar(web.navigationBar ?: ScreenNavigationBarMetadata()) },
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                if (url == null) {
                    SCNText("Endereço inválido", color = SCNTextColor.Muted)
                    return@Box
                }
                AndroidView(
                    modifier = Modifier
                        .fillMaxSize()
                        .alpha(if (phase == PagePhase.Loaded) 1f else 0f),
                    factory = { context ->
                        WebView(context).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            setBackgroundColor(android.graphics.Color.TRANSPARENT)
                            webViewClient = object : WebViewClient() {
                                override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
                                    canGoBack = view.canGoBack()
                                }

                                override fun onPageFinished(view: WebView, url: String?) {
                                    if (phase != PagePhase.Failed) phase = PagePhase.Loaded
                                    canGoBack = view.canGoBack()
                                }

                                override fun onReceivedError(
                                    view: WebView,
                                    request: WebResourceRequest,
                                    error: WebResourceError,
                                ) {
                                    if (request.isForMainFrame) phase = PagePhase.Failed
                                }
                            }
                            loadUrl(url)
                            webView = this
                        }
                    },
                )
                when (phase) {
                    PagePhase.Loading -> SCNSpinner()
                    PagePhase.Failed -> Column(
                        Modifier.padding(SCNSpace.s6),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(SCNSpace.s2),
                    ) {
                        SCNText("Não foi possível abrir a página", style = SCNTextStyle.Lg, weight = FontWeight.Medium)
                        SCNText(
                            "Verifique a conexão e tente de novo.",
                            color = SCNTextColor.Muted,
                            align = TextAlign.Center,
                        )
                        SCNButton("Tentar de novo", variant = SCNButtonVariant.Outline) {
                            phase = PagePhase.Loading
                            webView?.reload()
                        }
                    }
                    PagePhase.Loaded -> Unit
                }
            }
        }
    }
}
