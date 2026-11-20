package com.nshiftui.poc.services.services

import com.nshiftui.poc.domain.protocols.SendHTTPRequestServiceProtocol
import com.nshiftui.poc.network.APIClient
import com.nshiftui.poc.network.APIMethod
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse

class SendHTTPRequestService(
    private val client: APIClient,
) : SendHTTPRequestServiceProtocol {
    override suspend fun send(request: SendHTTPRequest): SendHTTPResponse {
        val raw = client.exchange(
            method = method(request.method),
            path = request.path,
            headers = request.headers,
            query = request.query,
            body = request.body.ifBlank { null },
        )
        return SendHTTPResponse(
            status = raw.status,
            body = raw.body,
        )
    }

    private fun method(raw: String): APIMethod = when (raw.uppercase()) {
        "POST" -> APIMethod.Post
        "PUT" -> APIMethod.Put
        "PATCH" -> APIMethod.Patch
        "DELETE" -> APIMethod.Delete
        else -> APIMethod.Get
    }
}
