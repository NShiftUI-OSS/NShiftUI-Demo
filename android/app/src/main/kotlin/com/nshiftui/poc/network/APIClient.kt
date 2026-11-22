package com.nshiftui.poc.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.HttpUrl.Companion.toHttpUrl
import kotlin.coroutines.cancellation.CancellationException
import java.util.concurrent.TimeUnit

class APIClient(
    private val baseURL: String,
    private val http: OkHttpClient = OkHttpClient(),
) {
    suspend inline fun <reified Response : Any> send(
        request: APIRequest<Response>,
    ): Response {
        val payload = read(request)
        try {
            return Json.decodeFromString(payload)
        } catch (error: SerializationException) {
            throw APIError.Decoding(error.message ?: error.toString())
        }
    }

    @PublishedApi
    internal suspend fun read(request: APIRequest<*>): String {
        val response = exchange(request)
        if (response.status !in 200..299) {
            throw APIError.Http(response.status, response.body)
        }
        return response.body
    }

    suspend fun exchange(
        method: APIMethod,
        path: String,
        headers: Map<String, String>,
        query: Map<String, String>,
        body: String?,
    ): APIRawResponse = exchange(
        object : APIRequest<Unit> {
            override val path = path
            override val method = method
            override val headers = headers
            override val query = query
            override val body = body?.let { raw ->
                APIJsonBody(Json.decodeFromString(JsonElement.serializer(), raw))
            }
        },
    )

    private suspend fun exchange(request: APIRequest<*>): APIRawResponse {
        if (baseURL.isBlank()) {
            throw APIError.InvalidURL()
        }
        try {
            return withContext(Dispatchers.IO) {
                val urlBuilder = if (
                    request.path.startsWith("http://") ||
                    request.path.startsWith("https://")
                ) {
                    request.path.toHttpUrl().newBuilder()
                } else {
                    baseURL
                        .trimEnd('/')
                        .toHttpUrl()
                        .newBuilder()
                        .apply {
                            val relative = request.path.trim('/')
                            if (relative.isNotEmpty()) {
                                addEncodedPathSegments(relative)
                            }
                        }
                }
                request.query.forEach { (name, value) ->
                    urlBuilder.addQueryParameter(name, value)
                }
                val url = urlBuilder.build()

                val body = request.body
                    ?.json
                    ?.toString()
                    ?.toRequestBody("application/json".toMediaType())
                val requestBuilder = Request.Builder()
                    .url(url)
                request.headers.forEach { (name, value) ->
                    requestBuilder.addHeader(name, value)
                }
                when (request.method) {
                    APIMethod.Get -> requestBuilder.get()
                    APIMethod.Post -> requestBuilder.post(body ?: EMPTY_BODY)
                    APIMethod.Put -> requestBuilder.put(body ?: EMPTY_BODY)
                    APIMethod.Patch -> requestBuilder.patch(body ?: EMPTY_BODY)
                    APIMethod.Delete -> requestBuilder.delete(body)
                }

                http.newBuilder()
                    .callTimeout(request.timeout.inWholeMilliseconds, TimeUnit.MILLISECONDS)
                    .build()
                    .newCall(requestBuilder.build())
                    .execute()
                    .use { response ->
                        APIRawResponse(
                            status = response.code,
                            body = response.body?.string().orEmpty(),
                        )
                    }
            }
        } catch (error: APIError) {
            throw error
        } catch (error: CancellationException) {
            throw APIError.Cancelled(error.message ?: "cancelled")
        } catch (error: Throwable) {
            throw APIError.Transport(error.message ?: error.toString())
        }
    }

    private companion object {
        val EMPTY_BODY = ByteArray(0).toRequestBody("application/json".toMediaType())
    }
}
