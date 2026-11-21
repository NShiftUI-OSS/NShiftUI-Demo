package com.nshiftui.poc.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

object SCNAppTheme {
    private const val PREFS = "scn.global.ds.theme"
    private const val KEY = "id"

    private var appContext: Context? = null

    var id by mutableStateOf(SCNThemeId.Neutral)
        private set

    fun install(context: Context) {
        val application = context.applicationContext
        appContext = application
        val stored = application
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY, null)
        id = SCNThemeId.resolve(stored.orEmpty()) ?: SCNThemeId.Neutral
    }

    fun change(raw: String): Boolean {
        val next = SCNThemeId.resolve(raw) ?: return false
        id = next
        appContext
            ?.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            ?.edit()
            ?.putString(KEY, next.name.lowercase())
            ?.apply()
        return true
    }
}
