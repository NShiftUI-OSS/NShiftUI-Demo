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
import com.nshiftui.NShiftView
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

class Screen private constructor(
    internal val requestedURL: String?,
    internal val screenTitle: String?,
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
                phase = Phase.Pending,
            )
    }

    fun url(value: String): Screen =
        copy(requestedURL = value, phase = Phase.Pending)

    fun title(value: String?): Screen =
        copy(screenTitle = value?.takeIf { it.isNotBlank() })

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
        phase: Phase = this.phase,
    ) = Screen(requestedURL, screenTitle, phase)
}

@Composable
private fun ResolvedScreen(
    builder: Screen,
    onBack: (() -> Unit)?,
) {
    var attempt by remember(builder.requestedURL) { mutableIntStateOf(0) }
    var phase by remember(builder.requestedURL) { mutableStateOf(builder.phase) }
    var retrying by remember(builder.requestedURL) { mutableStateOf(false) }
    val refresh = remember(builder.requestedURL) { ScreenRefreshObserver() }
    LaunchedEffect(builder.requestedURL, attempt) {
        if (phase !is Screen.Phase.Pending) return@LaunchedEffect
        val started = if (attempt > 0) System.nanoTime() else 0L
        val loaded = builder.load()
        if (attempt > 0) holdRetryLoading(started)
        phase = loaded.phase
        retrying = false
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
        ) {
            NShiftView(current.model)
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
        val started = if (attempt > 0) System.nanoTime() else 0L
        failed = false
        val loaded = builder.load()
        if (attempt > 0) holdRetryLoading(started)
        if (loaded.isLoaded) {
            loadedBuilder = loaded
        } else {
            failed = true
        }
        retrying = false
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

private const val RETRY_LOADING_NANOS = 800_000_000L

private suspend fun holdRetryLoading(startedAt: Long) {
    val wait = RETRY_LOADING_NANOS - (System.nanoTime() - startedAt)
    if (wait > 0) delay(wait / 1_000_000)
}
