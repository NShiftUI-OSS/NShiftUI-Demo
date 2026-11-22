package com.nshiftui.poc.navigation

import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.navigation.NavHostController
import com.nshiftui.NShiftPluginModel
import com.nshiftui.poc.config.NShiftAppConfiguration
import com.nshiftui.poc.sdui.plugandplay.Screen

const val ModalRoutePrefix = "modal/"

class AppNavigator {
    private var controller: NavHostController? = null
    private val preloaded = mutableMapOf<String, NShiftPluginModel>()

    fun attach(controller: NavHostController?) {
        this.controller = controller
    }

    val canPop: Boolean
        get() = controller?.previousBackStackEntry != null

    fun pushScreen(
        screenName: String?,
        parameters: Map<String, String> = emptyMap(),
    ) {
        val name = screenName?.takeIf { it.isNotBlank() } ?: return
        onMain { controller?.navigate(route(name, parameters)) }
    }

    suspend fun pushAsync(
        screenName: String?,
        parameters: Map<String, String> = emptyMap(),
    ): Boolean {
        val name = screenName?.takeIf { it.isNotBlank() } ?: return false
        val loaded = Screen()
            .url(NShiftAppConfiguration.current.runtimeScreenURL(name, parameters))
            .routeParameters(parameters)
            .title(name)
            .load()
        val model = loaded.loadedModel ?: return false
        preloaded[routeKey(name, parameters)] = model
        onMain { controller?.navigate(route(name, parameters)) }
        return true
    }

    fun consumePreloaded(
        screenName: String,
        parameters: Map<String, String> = emptyMap(),
    ): NShiftPluginModel? = preloaded.remove(routeKey(screenName, parameters))

    /** Presents a screen modally (it slides up over the current one). */
    fun presentModal(
        screenName: String?,
        parameters: Map<String, String> = emptyMap(),
    ) {
        val name = screenName?.takeIf { it.isNotBlank() } ?: return
        onMain { controller?.navigate(route(name, parameters, ModalRoutePrefix)) }
    }

    /** Closes the modal screen on top; false when the top screen is not modal. */
    fun dismissModal(): Boolean {
        val controller = controller ?: return false
        val top = controller.currentBackStackEntry?.destination?.route ?: return false
        if (!top.startsWith(ModalRoutePrefix)) return false
        controller.popBackStack()
        return true
    }

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

    private fun route(
        name: String,
        parameters: Map<String, String> = emptyMap(),
        prefix: String = "screen/",
    ): String {
        val base = "$prefix${Uri.encode(name)}"
        if (parameters.isEmpty()) return base
        return "$base?context=${Uri.encode(Deeplink.encodeParameters(parameters))}"
    }

    private fun routeKey(name: String, parameters: Map<String, String>): String =
        "$name?${Deeplink.encodeParameters(parameters)}"

    private fun onMain(block: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            block()
        } else {
            Handler(Looper.getMainLooper()).post(block)
        }
    }
}
