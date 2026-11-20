package com.nshiftui.poc.domain.usecases

import com.nshiftui.poc.domain.protocols.SendHTTPRequestServiceProtocol
import com.nshiftui.poc.domain.protocols.SendHTTPRequestUseCaseProtocol
import com.nshiftui.poc.services.requests.SendHTTPRequest
import com.nshiftui.poc.services.responses.SendHTTPResponse

class SendHTTPRequestUseCase(
    private val service: SendHTTPRequestServiceProtocol,
) : SendHTTPRequestUseCaseProtocol {
    override suspend fun execute(request: SendHTTPRequest): SendHTTPResponse = service.send(request)
}
