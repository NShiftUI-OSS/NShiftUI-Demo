package com.nshiftui.poc

import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import com.nshiftui.NShiftConfig
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import com.nshiftui.poc.navigation.AppCloser
import com.nshiftui.poc.ui.components.SCNSuccessOverlayHost
import com.nshiftui.poc.ui.components.SCNToastHost
import com.nshiftui.poc.navigation.AppNavigator
import com.nshiftui.poc.navigation.NavigationHost
import com.nshiftui.poc.theme.LocalSCNTheme
import com.nshiftui.poc.theme.ProvideSCNTheme
import com.nshiftui.poc.theme.SCNAppTheme
import com.nshiftui.poc.theme.SCNPresets
import com.nshiftui.poc.theme.SCNTheme
import com.nshiftui.resolveOrThrow

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppCloser.attach(this)
        enableEdgeToEdge()
        setContent { SCNPocApp() }
    }

    override fun onDestroy() {
        AppCloser.detach(this)
        super.onDestroy()
    }
}

@Composable
private fun SCNPocApp() {
    val dark = isSystemInDarkTheme()
    val themeId = SCNAppTheme.id
    ProvideSCNTheme(SCNTheme(SCNPresets.named(themeId), dark)) {
        val colors = LocalSCNTheme.current.palette
        val view = LocalView.current
        SideEffect {
            (view.context as? android.app.Activity)?.window?.setBackgroundDrawable(
                ColorDrawable(colors.background.toArgb()),
            )
        }
        val navigator = remember {
            NShiftConfig.shared.hostContainer!!.resolveOrThrow<AppNavigator>()
        }
        Box(Modifier.fillMaxSize()) {
            NavigationHost(navigator)
            SCNToastHost()
            SCNSuccessOverlayHost()
        }
    }
}
