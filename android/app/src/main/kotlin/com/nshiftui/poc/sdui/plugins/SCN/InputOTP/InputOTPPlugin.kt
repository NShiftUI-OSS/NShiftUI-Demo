package com.nshiftui.poc.sdui.plugins.scn.inputotp
import com.nshiftui.poc.sdui.triggers.trackScreenInput
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.store
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.ui.components.SCNOtpField

@kotlinx.serialization.Serializable
data class InputOTPMetadata(
    val length: Int,
    val code: String,
) : NShiftMetadata

@NShiftPlugin(
    name = "InputOTP",
    version = "1.0.0",
    metadata = InputOTPMetadata::class,
)
class InputOTPPlugin : NShiftPluginWithMetadata<InputOTPMetadata>(
    "InputOTP",
    "1.0.0",
    InputOTPMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNOtpField(
            length = metadata.length,
            code = metadata.code,
            onCodeChange = { code ->
                store(
                    metadata.copy(code = code),
                    NShiftTrigger.onChange,
                    scope,
                )
                if (code.length == metadata.length) {
                    fire(NShiftTrigger.onComplete, scope)
                }
            },
        )
    }
}
