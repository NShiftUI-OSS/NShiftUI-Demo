package com.nshiftui.poc.sdui.plugins.scn.spinner
import androidx.compose.runtime.Composable
import com.nshiftui.NShiftPlugin
import com.nshiftui.macro.NShiftPlugin as NShiftPluginMacro
import com.nshiftui.poc.ui.components.SCNSpinner

@NShiftPluginMacro(
    name = "Spinner",
    version = "1.0.0",
)
class SpinnerPlugin : NShiftPlugin(
    "Spinner",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        SCNSpinner()
    }
}
