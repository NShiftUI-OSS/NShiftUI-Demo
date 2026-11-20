package com.nshiftui.poc.sdui.plugins.primitive.horizontalscroll

import androidx.compose.runtime.Composable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.Modifier
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "HorizontalScroll",
    version = "1.0.0",
)
class HorizontalScrollPlugin : NShiftPluginWithViewModel(
    "HorizontalScroll",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
        ) {
            children()
        }
    }
}
