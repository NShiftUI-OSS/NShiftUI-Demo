package com.nshiftui.poc.sdui.plugins.scn.calendar
import com.nshiftui.poc.sdui.triggers.trackScreenInput
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftPluginWithMetadata
import com.nshiftui.macro.NShiftPlugin
import com.nshiftui.NShiftTrigger
import com.nshiftui.poc.sdui.triggers.fire
import com.nshiftui.poc.sdui.triggers.store
import com.nshiftui.poc.sdui.triggers.onChange
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onDismiss
import com.nshiftui.poc.sdui.triggers.onSelect
import com.nshiftui.poc.sdui.triggers.onTap
import com.nshiftui.poc.ui.components.SCNCalendar

@kotlinx.serialization.Serializable
data class CalendarMetadata(
    val selection: Long,
) : NShiftMetadata

@NShiftPlugin(
    name = "Calendar",
    version = "1.0.0",
    metadata = CalendarMetadata::class,
)
class CalendarPlugin : NShiftPluginWithMetadata<CalendarMetadata>(
    "Calendar",
    "1.0.0",
    CalendarMetadata::class,
) {
    @Composable
    override fun Content() {
        trackScreenInput(metadata.toString())
        val scope = rememberCoroutineScope()
        SCNCalendar(
            selection = metadata.selection,
            onSelect = { value -> store(metadata.copy(selection = value), NShiftTrigger.onSelect, scope) },
        )
    }
}
