package com.nshiftui.poc.network

sealed class APIError(message: String? = null) : Exception(message) {
    class InvalidURL : APIError()

    class Transport(message: String) : APIError(message)

    class Http(
        val status: Int,
        val body: String,
    ) : APIError()

    class Decoding(message: String) : APIError(message)

    class Cancelled(message: String) : APIError(message)
}
