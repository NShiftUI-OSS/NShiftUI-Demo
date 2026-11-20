package com.nshiftui.poc.sdui.plugins.scn.separator
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftPlugin
import com.nshiftui.macro.NShiftPlugin as NShiftPluginMacro
import com.nshiftui.poc.ui.components.SCNSeparator

@NShiftPluginMacro(
    name = "Separator",
    version = "1.0.0",
)
class SeparatorPlugin : NShiftPlugin(
    "Separator",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        SCNSeparator()
    }
}
