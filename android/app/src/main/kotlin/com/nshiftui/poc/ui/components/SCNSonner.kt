package com.nshiftui.poc.ui.components

import androidx.compose.runtime.Composable

@Composable
fun SCNSonner(
    title: String,
    message: String? = null,
) {
    SCNToast(
        title = title,
        message = message,
    )
}
