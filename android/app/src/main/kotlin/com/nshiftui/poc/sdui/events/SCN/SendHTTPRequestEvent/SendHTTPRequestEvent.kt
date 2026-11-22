package com.nshiftui.poc.sdui.events.scn.sendhttprequestevent

import com.nshiftui.NShiftEventWithMetadata
import com.nshiftui.NShiftEngine
import com.nshiftui.NShiftMetadata
import com.nshiftui.NShiftTrigger
import com.nshiftui.macro.NShiftEvent
import com.nshiftui.poc.sdui.events.scn.eventdispatch.dispatch
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.poc.sdui.triggers.onComplete
import com.nshiftui.poc.sdui.triggers.onFailure
import com.nshiftui.poc.sdui.triggers.onStatusCode
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.resolveOrThrow

@kotlinx.serialization.Serializable
@com.nshiftui.NShiftJSONTagged(["body"])
data class SendHTTPRequestEventMetadata(
    val method: String = "GET",
    val path: String = "",
    val headers: Map<String, String> = emptyMap(),
    val query: Map<String, String> = emptyMap(),
    val body: String = "",
    val appendTo: String = "",
    val pageSize: Int = 3,
) : NShiftMetadata

@NShiftEvent(
    name = "SendHTTPRequestEvent",
    version = "1.0.0",
    metadata = SendHTTPRequestEventMetadata::class,
)
class SendHTTPRequestEvent : NShiftEventWithMetadata<SendHTTPRequestEventMetadata>(
    "SendHTTPRequestEvent",
    "1.0.0",
    SendHTTPRequestEventMetadata::class,
) {
    override suspend fun execute() {
        val http = viewModel as? ScreenViewModel
        if (http == null) {
            dispatch(this, NShiftTrigger.onFailure)
            return
        }
        val response = try {
            if (metadata.appendTo.isNotBlank()) {
                http.appendPokedexPage(
                    engine = http.renderingEngine ?: resolver.resolveOrThrow<NShiftEngine>(),
                    parentID = metadata.appendTo,
                    endpoint = metadata.path,
                    limit = metadata.pageSize,
                )
            } else {
                http.sendHTTPRequest(
                    SendHTTPRequest(
                        method = metadata.method,
                        path = metadata.path,
                        headers = metadata.headers,
                        query = metadata.query,
                        body = metadata.body,
                    ),
                )
            }
        } catch (_: Exception) {
            dispatch(this, NShiftTrigger.onFailure)
            return
        }
        NShiftTrigger.onStatusCode(response.status)?.let { trigger ->
            dispatch(this, trigger)
        }
        if (response.status in 200..299) {
            dispatch(this, NShiftTrigger.onComplete)
        }
    }
}
