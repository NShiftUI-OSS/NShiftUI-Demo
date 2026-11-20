package com.nshiftui.poc.sdui.plugins.scn.card
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin as NShiftPluginMacro
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNCard

@NShiftPluginMacro(
    name = "Card",
    version = "1.0.0",
)
class CardPlugin : NShiftPlugin(
    "Card",
    "1.0.0",
) {
    @Composable
    override fun Content() {
        val scope = rememberCoroutineScope()
        SCNCard(
            onClick = { fire(NShiftTrigger.onTap, scope) },
        ) {
            children()
        }
    }
}
