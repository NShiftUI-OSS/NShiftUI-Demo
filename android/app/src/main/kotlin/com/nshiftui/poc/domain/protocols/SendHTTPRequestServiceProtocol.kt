package com.nshiftui.poc.domain.protocols

import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse

interface SendHTTPRequestServiceProtocol {
    suspend fun send(request: SendHTTPRequest): SendHTTPResponse
}
