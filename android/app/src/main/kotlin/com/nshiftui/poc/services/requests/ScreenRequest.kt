package com.nshiftui.poc.services.requests

data class ScreenRequest(
    val path: String,
    val query: Map<String, String>,
)
