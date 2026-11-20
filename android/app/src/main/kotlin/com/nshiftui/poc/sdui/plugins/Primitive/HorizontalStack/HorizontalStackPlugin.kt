package com.nshiftui.poc.sdui.plugins.primitive.horizontalstack

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Row
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "HorizontalStack",
    version = "1.0.0",
)
class HorizontalStackPlugin : NShiftPluginWithViewModel(
    "HorizontalStack",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        Row {
            children()
        }
    }
}
