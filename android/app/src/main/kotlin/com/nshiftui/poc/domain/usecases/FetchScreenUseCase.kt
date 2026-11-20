package com.nshiftui.poc.domain.usecases

import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftRainbowCompiler
import com.nshiftui.poc.domain.errors.FetchScreenError
import com.nshiftui.poc.domain.models.RuntimeScreenResponse
import com.nshiftui.poc.domain.models.ScreenURL
import com.nshiftui.poc.domain.protocols.FetchScreenUseCaseProtocol
import com.nshiftui.poc.domain.protocols.ScreenServiceProtocol
import com.nshiftui.poc.services.requests.ScreenRequest
import com.nshiftui.poc.services.responses.ScreenResponse
import kotlinx.serialization.json.Json

private val runtimeJson = Json { ignoreUnknownKeys = true }

class FetchScreenUseCase(
    private val service: ScreenServiceProtocol,
) : FetchScreenUseCaseProtocol {
    override suspend fun execute(url: String): NShiftPluginModel {
        val target = urlTarget(url)
        val response = fetchScreen(target)
        val rainbow = rainbowSource(response)
        return screenModel(rainbow)
    }

    private fun urlTarget(url: String): ScreenURL {
        return ScreenURL(url) ?: throw FetchScreenError()
    }

    private suspend fun fetchScreen(target: ScreenURL): ScreenResponse {
        val response = try {
            service.fetch(
                ScreenRequest(
                    path = target.path,
                    query = target.query,
                ),
            )
        } catch (_: Exception) {
            throw FetchScreenError()
        }
        if (response.status !in 200..299) {
            throw FetchScreenError()
        }
        return response
    }

    private fun rainbowSource(response: ScreenResponse): String {
        val runtime = try {
            runtimeJson.decodeFromString<RuntimeScreenResponse>(response.body)
        } catch (_: Exception) {
            throw FetchScreenError()
        }
        return runtime.data.rainbow
    }

    private fun screenModel(rainbow: String): NShiftPluginModel {
        val model = try {
            NShiftRainbowCompiler().compile(rainbow)
        } catch (_: Exception) {
            throw FetchScreenError()
        }
        if (model.name.rawValue != "Screen") {
            throw FetchScreenError()
        }
        return model
    }
}
