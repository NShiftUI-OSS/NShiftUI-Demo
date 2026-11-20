package com.nshiftui.poc.sdui.plugins.primitive.verticalstack

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Column
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "VerticalStack",
    version = "1.0.0",
)
class VerticalStackPlugin : NShiftPluginWithViewModel(
    "VerticalStack",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        Column {
            children()
        }
    }
}
