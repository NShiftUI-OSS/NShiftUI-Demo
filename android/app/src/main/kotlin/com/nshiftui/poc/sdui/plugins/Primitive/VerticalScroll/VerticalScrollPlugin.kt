package com.nshiftui.poc.sdui.plugins.primitive.verticalscroll

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.Modifier
import com.nshiftui.NShiftPluginWithViewModel
import com.nshiftui.macro.NShiftPlugin

@NShiftPlugin(
    name = "VerticalScroll",
    version = "1.0.0",
)
class VerticalScrollPlugin : NShiftPluginWithViewModel(
    "VerticalScroll",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 240.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            children()
        }
    }
}
