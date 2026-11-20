package com.nshiftui.poc.network

import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.encodeToJsonElement

interface APIRequest<Response> {
    val path: String
    val method: APIMethod
        get() = APIMethod.Get
    val headers: Map<String, String>
        get() = emptyMap()
    val query: Map<String, String>
        get() = emptyMap()
    val body: APIJsonBody?
        get() = null
    val timeout: Duration
        get() = 30.seconds
}

class APIJsonBody(
    val json: JsonElement,
)

object APIJSON {
    inline fun <reified Body> body(value: Body): APIJsonBody =
        APIJsonBody(Json.encodeToJsonElement(value))
}

class APIStatusRequest : APIRequest<APIStatus> {
    override val path = "status"
}

@kotlinx.serialization.Serializable
class APIStatus(
    val ok: Boolean = false,
)

data class APIRawResponse(
    val status: Int,
    val body: String,
)
