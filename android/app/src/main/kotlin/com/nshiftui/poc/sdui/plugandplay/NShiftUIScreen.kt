package com.nshiftui.poc.sdui.plugandplay

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.nshiftui.NShiftPluginModel
import com.nshiftui.NShiftEngineTree
import com.nshiftui.NShiftView
import com.nshiftui.makeNShiftEngine
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nshiftui.NShiftConfig
import com.nshiftui.poc.domain.protocols.FetchScreenUseCaseProtocol
import com.nshiftui.poc.screens.ErrorScreen
import com.nshiftui.poc.screens.LoadingScreen
import com.nshiftui.poc.screens.NShiftLaunchScreen
import com.nshiftui.poc.sdui.observers.LocalScreenRefresh
import com.nshiftui.poc.sdui.observers.ScreenRefreshObserver
import com.nshiftui.poc.sdui.plugins.scn.screen.LocalScreenBack
import com.nshiftui.resolveOrThrow
import kotlinx.coroutines.delay

val LocalScreenRouteParameters = androidx.compose.runtime.staticCompositionLocalOf<Map<String, String>> {
    emptyMap()
}

class Screen private constructor(
    internal val requestedURL: String?,
    internal val screenTitle: String?,
    internal val routeParameters: Map<String, String>,
    internal val phase: Phase,
) {
    internal sealed interface Phase {
        data object Pending : Phase
        data object Failed : Phase
        data class Loaded(val model: NShiftPluginModel) : Phase
    }

    companion object {
        operator fun invoke(): Screen =
            Screen(
                requestedURL = null,
                screenTitle = null,
                routeParameters = emptyMap(),
                phase = Phase.Pending,
            )
    }

    fun url(value: String): Screen =
        copy(requestedURL = value, phase = Phase.Pending)

    fun title(value: String?): Screen =
        copy(screenTitle = value?.takeIf { it.isNotBlank() })

    fun routeParameters(value: Map<String, String>): Screen =
        copy(routeParameters = value)

    val isLoaded: Boolean
        get() = phase is Phase.Loaded

    val loadedModel: NShiftPluginModel?
        get() = (phase as? Phase.Loaded)?.model

    fun preloaded(model: NShiftPluginModel): Screen =
        copy(phase = Phase.Loaded(model))

    suspend fun load(): Screen {
        val target = requestedURL
        val useCase = NShiftConfig.shared.hostContainer
            ?.resolveOrThrow<FetchScreenUseCaseProtocol>()
        if (target.isNullOrBlank() || useCase == null) {
            return copy(phase = Phase.Failed)
        }
        return try {
            copy(phase = Phase.Loaded(useCase.execute(target)))
        } catch (_: Exception) {
            copy(phase = Phase.Failed)
        }
    }

    @Composable
    fun resolve(onBack: (() -> Unit)? = null) {
        ResolvedScreen(this, onBack)
    }

    @Composable
    fun startup(onBack: (() -> Unit)? = null) {
        ScreenStartup(this, onBack)
    }

    private fun copy(
        requestedURL: String? = this.requestedURL,
        screenTitle: String? = this.screenTitle,
        routeParameters: Map<String, String> = this.routeParameters,
        phase: Phase = this.phase,
    ) = Screen(requestedURL, screenTitle, routeParameters, phase)
}

@Composable
private fun ResolvedScreen(
    builder: Screen,
    onBack: (() -> Unit)?,
) {
    val retained = viewModel<RetainedScreenState>(key = "nshift-screen:${builder.requestedURL}")
    var attempt by remember(builder.requestedURL) { mutableIntStateOf(0) }
    var phase by remember(builder.requestedURL) { mutableStateOf(retained.phase ?: builder.phase) }
    var retrying by remember(builder.requestedURL) { mutableStateOf(false) }
    val refresh = remember(builder.requestedURL) { ScreenRefreshObserver() }
    LaunchedEffect(builder.requestedURL, attempt) {
        if (phase !is Screen.Phase.Pending) return@LaunchedEffect
        if (attempt > 0) {
            delay(RETRY_DELAY_MILLIS)
            phase = builder.load().phase
            retrying = false
            return@LaunchedEffect
        }
        val started = System.nanoTime()
        val loaded = builder.load()
        holdFetchPresentation(started)
        phase = loaded.phase
    }
    LaunchedEffect(refresh) {
        refresh.events.collect {
            val loaded = builder.load()
            if (loaded.isLoaded) {
                phase = loaded.phase
            }
            refresh.finish()
        }
    }
    when (val current = phase) {
        Screen.Phase.Pending -> LoadingScreen(onBack)
        Screen.Phase.Failed -> ErrorScreen(builder.screenTitle, onBack) {
            if (retrying) return@ErrorScreen
            retrying = true
            phase = Screen.Phase.Pending
            attempt += 1
        }
        is Screen.Phase.Loaded -> CompositionLocalProvider(
            LocalScreenBack provides onBack,
            LocalScreenRefresh provides refresh,
            LocalScreenRouteParameters provides builder.routeParameters,
        ) {
            retained.phase = current
            NShiftView(retained.engine(current.model))
        }
    }
}

internal class RetainedScreenState : ViewModel() {
    var phase: Screen.Phase? = null
    private var model: NShiftPluginModel? = null
    private var engine: NShiftEngineTree? = null

    fun engine(model: NShiftPluginModel): NShiftEngineTree {
        val current = engine
        if (current != null && this.model === model) return current
        return makeNShiftEngine(model).also {
            this.model = model
            engine = it
        }
    }
}

@Composable
private fun ScreenStartup(
    builder: Screen,
    onBack: (() -> Unit)?,
) {
    var attempt by remember(builder.requestedURL) { mutableIntStateOf(0) }
    var loadedBuilder by remember(builder.requestedURL) {
        mutableStateOf<Screen?>(null)
    }
    var failed by remember(builder.requestedURL) { mutableStateOf(false) }
    var retrying by remember(builder.requestedURL) { mutableStateOf(false) }

    LaunchedEffect(builder.requestedURL, attempt) {
        failed = false
        if (attempt > 0) {
            delay(RETRY_DELAY_MILLIS)
            val loaded = builder.load()
            if (loaded.isLoaded) {
                loadedBuilder = loaded
            } else {
                failed = true
            }
            retrying = false
            return@LaunchedEffect
        }
        val started = System.nanoTime()
        val loaded = builder.load()
        holdFetchPresentation(started)
        if (loaded.isLoaded) {
            loadedBuilder = loaded
        } else {
            failed = true
        }
    }

    when {
        loadedBuilder != null -> loadedBuilder!!.resolve(onBack)
        failed -> ErrorScreen(builder.screenTitle, onBack) {
            if (retrying) return@ErrorScreen
            retrying = true
            failed = false
            attempt += 1
        }
        else -> NShiftLaunchScreen()
    }
}

private const val FETCH_PRESENTATION_FLOOR_NANOS = 1_000_000_000L
private const val RETRY_DELAY_MILLIS = 1_000L

private suspend fun holdFetchPresentation(startedAt: Long) {
    val wait = FETCH_PRESENTATION_FLOOR_NANOS - (System.nanoTime() - startedAt)
    if (wait > 0) delay(wait / 1_000_000)
}
