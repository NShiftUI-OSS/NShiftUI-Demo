package com.nshiftui.poc.domain.protocols

import com.nshiftui.poc.services.requests.ScreenRequest
import com.nshiftui.poc.services.responses.ScreenResponse

interface ScreenServiceProtocol {
    suspend fun fetch(request: ScreenRequest): ScreenResponse
}
