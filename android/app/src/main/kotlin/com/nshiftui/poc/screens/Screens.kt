package com.nshiftui.poc.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.nshiftui.poc.sdui.plugins.scn.screen.AndroidNavigationBar
import com.nshiftui.poc.sdui.plugins.scn.screen.LocalScreenBack
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenNavigationBarMetadata
import com.nshiftui.poc.sdui.plugins.scn.tabbar.LocalTabBarHosted
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.components.SCNButton
import com.nshiftui.poc.ui.components.SCNButtonVariant
import com.nshiftui.poc.ui.components.SCNSpinner
import com.nshiftui.poc.ui.components.SCNText
import com.nshiftui.poc.ui.components.SCNTextColor
import com.nshiftui.poc.ui.components.SCNTextStyle

/** True on screens presented with `presentation: "modal"`. */
val LocalModalPresentation = compositionLocalOf { false }

@Composable
fun NShiftLaunchScreen() {
    Column(
        Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(
            SCNSpace.s4,
            Alignment.CenterVertically,
        ),
    ) {
        SCNText(
            "NShiftUI",
            style = SCNTextStyle.Xl,
            weight = FontWeight.SemiBold,
        )
        SCNSpinner()
    }
}

@Composable
fun LoadingScreen(
    onBack: (() -> Unit)?,
) {
    if (LocalTabBarHosted.current) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            SCNSpinner()
        }
    } else {
        ScreenBar(title = null, onBack = onBack) {
            SCNSpinner()
        }
    }
}

@Composable
fun ErrorScreen(
    title: String?,
    onBack: (() -> Unit)?,
    onRetry: () -> Unit,
) {
    val message = @Composable {
        Column(
            Modifier
                .fillMaxWidth()
                .padding(SCNSpace.s6),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(SCNSpace.s2),
        ) {
            SCNText(
                "Couldn't load this screen",
                style = SCNTextStyle.Lg,
                weight = FontWeight.Medium,
            )
            SCNText(
                "Check the connection and try again.",
                color = SCNTextColor.Muted,
                align = TextAlign.Center,
            )
            SCNButton(
                "Try again",
                variant = SCNButtonVariant.Outline,
                onClick = onRetry,
            )
        }
    }
    if (LocalTabBarHosted.current) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            message()
        }
    } else {
        ScreenBar(title, onBack) {
            message()
        }
    }
}

@Composable
private fun ScreenBar(
    title: String?,
    onBack: (() -> Unit)?,
    content: @Composable () -> Unit,
) {
    val colors = LocalSCNTheme.current.palette
    val modal = LocalModalPresentation.current
    Scaffold(
        containerColor = colors.background,
        topBar = {
            CompositionLocalProvider(LocalScreenBack provides onBack) {
                AndroidNavigationBar(
                    ScreenNavigationBarMetadata(
                        title = title.orEmpty(),
                        trailing = if (modal && onBack != null) "close" else "none",
                    ),
                )
            }
        },
    ) { padding ->
        Box(
            Modifier
                .fillMaxSize()
                .padding(padding),
            contentAlignment = Alignment.Center,
        ) {
            content()
        }
    }
}
