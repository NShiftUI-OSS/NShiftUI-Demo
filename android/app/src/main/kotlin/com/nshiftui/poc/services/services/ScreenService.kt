package com.nshiftui.poc.services.services

import com.nshiftui.poc.domain.protocols.ScreenServiceProtocol
import com.nshiftui.poc.network.APIClient
import com.nshiftui.poc.network.APIMethod
import com.nshiftui.poc.services.requests.ScreenRequest
import com.nshiftui.poc.services.responses.ScreenResponse

class ScreenService(
    private val client: APIClient,
) : ScreenServiceProtocol {
    override suspend fun fetch(request: ScreenRequest): ScreenResponse {
        val raw = client.exchange(
            method = APIMethod.Get,
            path = request.path,
            headers = emptyMap(),
            query = request.query,
            body = null,
        )
        return ScreenResponse(
            status = raw.status,
            body = raw.body,
        )
    }
}
