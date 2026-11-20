package com.nshiftui.poc.domain.protocols

import com.nshiftui.NShiftPluginModel

interface FetchScreenUseCaseProtocol {
    suspend fun execute(url: String): NShiftPluginModel
}
