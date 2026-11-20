package com.nshiftui.poc.services.requests

data class SendHTTPRequest(
    val method: String,
    val path: String,
    val headers: Map<String, String>,
    val query: Map<String, String>,
    val body: String,
)
