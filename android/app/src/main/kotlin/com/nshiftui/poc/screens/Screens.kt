package com.nshiftui.poc.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.nshiftui.poc.sdui.plugins.scn.tabbar.LocalTabBarHosted
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNSpace
import com.nshiftui.poc.ui.SCNIcon
import com.nshiftui.poc.ui.components.SCNButton
import com.nshiftui.poc.ui.components.SCNButtonVariant
import com.nshiftui.poc.ui.components.SCNSpinner
import com.nshiftui.poc.ui.components.SCNText
import com.nshiftui.poc.ui.components.SCNTextColor
import com.nshiftui.poc.ui.components.SCNTextStyle

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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ScreenBar(
    title: String?,
    onBack: (() -> Unit)?,
    content: @Composable () -> Unit,
) {
    val colors = LocalSCNTheme.current.palette
    Scaffold(
        containerColor = colors.background,
        topBar = {
            TopAppBar(
                title = {
                    if (!title.isNullOrBlank()) {
                        SCNText(title, weight = FontWeight.SemiBold)
                    }
                },
                navigationIcon = {
                    if (onBack != null) {
                        Box(
                            Modifier
                                .size(SCNSpace.s11)
                                .clickable(onClick = onBack),
                            contentAlignment = Alignment.Center,
                        ) {
                            SCNIcon(
                                "arrow-left",
                                size = SCNSpace.s5,
                                tint = colors.foreground,
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = colors.background,
                    titleContentColor = colors.foreground,
                ),
            )
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
