package com.nshiftui.poc.ui.components

import androidx.compose.runtime.Composable
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.SCNPalette
import com.nshiftui.poc.theme.SCNTheme

internal val theme: SCNTheme
    @Composable get() = LocalSCNTheme.current

internal val colors: SCNPalette
    @Composable get() = theme.palette
