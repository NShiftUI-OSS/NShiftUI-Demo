package com.nshiftui.poc.navigation

import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.navigation.NavHostController
import com.nshiftui.NShiftPluginModel
import com.nshiftui.poc.config.NShiftAppConfiguration
import com.nshiftui.poc.sdui.plugandplay.Screen

class AppNavigator {
    private var controller: NavHostController? = null
    private val preloaded = mutableMapOf<String, NShiftPluginModel>()

    fun attach(controller: NavHostController?) {
        this.controller = controller
    }

    val canPop: Boolean
        get() = controller?.previousBackStackEntry != null

    fun pushScreen(screenName: String?) {
        val name = screenName?.takeIf { it.isNotBlank() } ?: return
        onMain { controller?.navigate(route(name)) }
    }

    suspend fun pushAsync(screenName: String?): Boolean {
        val name = screenName?.takeIf { it.isNotBlank() } ?: return false
        val loaded = Screen()
            .url(NShiftAppConfiguration.current.runtimeScreenURL(name))
            .title(name)
            .load()
        val model = loaded.loadedModel ?: return false
        preloaded[name] = model
        onMain { controller?.navigate(route(name)) }
        return true
    }

    fun consumePreloaded(screenName: String): NShiftPluginModel? = preloaded.remove(screenName)

    fun pop() {
        pop(steps = 1)
    }

    fun pop(steps: Int) {
        val times = steps.coerceAtLeast(1)
        onMain {
            val controller = controller ?: return@onMain
            repeat(times) {
                if (controller.previousBackStackEntry == null) return@onMain
                controller.popBackStack()
            }
        }
    }

    fun popToRoot() {
        onMain {
            val controller = controller ?: return@onMain
            val start = controller.graph.startDestinationRoute ?: return@onMain
            controller.popBackStack(start, false)
        }
    }

    fun popToScreen(name: String) {
        val target = name.takeIf { it.isNotBlank() } ?: return
        onMain { controller?.popBackStack(route(target), false) }
    }

    fun popTo(deeplink: String) {
        val name = Deeplink.parse(deeplink)?.screenName?.takeIf { it.isNotBlank() } ?: return
        onMain { controller?.popBackStack(route(name), false) }
    }

    private fun route(name: String) = "screen/${Uri.encode(name)}"

    private fun onMain(block: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            block()
        } else {
            Handler(Looper.getMainLooper()).post(block)
        }
    }
}
