package com.nshiftui.poc.navigation

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.IntOffset
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.nshiftui.poc.config.NShiftAppConfiguration
import com.nshiftui.poc.screens.LocalModalPresentation
import com.nshiftui.poc.sdui.plugandplay.Screen
import com.nshiftui.poc.theme.LocalSCNTheme

private const val ScreenRoute = "screen/{name}?context={context}"
private const val ModalRoute = "modal/{name}?context={context}"

@Composable
fun NavigationHost(navigator: AppNavigator) {
    val navController = rememberNavController()
    val start = "screen/${android.net.Uri.encode(NShiftAppConfiguration.current.initialScreenName)}"
    DisposableEffect(navController) {
        navigator.attach(navController)
        onDispose { navigator.attach(null) }
    }
    val motion = tween<IntOffset>(durationMillis = 300, easing = FastOutSlowInEasing)
    NavHost(
        navController = navController,
        startDestination = start,
        modifier = Modifier
            .fillMaxSize()
            .background(LocalSCNTheme.current.palette.background),
        enterTransition = { slideInHorizontally(motion) { fullWidth -> fullWidth } },
        exitTransition = {
            if (targetState.destination.route == ModalRoute) {
                ExitTransition.KeepUntilTransitionsFinished
            } else {
                slideOutHorizontally(motion) { fullWidth -> -fullWidth / 5 }
            }
        },
        popEnterTransition = {
            if (initialState.destination.route == ModalRoute) {
                EnterTransition.None
            } else {
                slideInHorizontally(motion) { fullWidth -> -fullWidth / 5 }
            }
        },
        popExitTransition = { slideOutHorizontally(motion) { fullWidth -> fullWidth } },
    ) {
        composable(
            route = ScreenRoute,
            arguments = listOf(
                navArgument("name") { type = NavType.StringType },
                navArgument("context") {
                    type = NavType.StringType
                    defaultValue = ""
                },
            ),
        ) { entry ->
            ScreenDestination(entry, navController, navigator)
        }
        // `presentation: "modal"`: slides up from the bottom and back down.
        composable(
            route = ModalRoute,
            arguments = listOf(
                navArgument("name") { type = NavType.StringType },
                navArgument("context") {
                    type = NavType.StringType
                    defaultValue = ""
                },
            ),
            enterTransition = { slideInVertically(modalMotion) { fullHeight -> fullHeight } },
            exitTransition = {
                if (targetState.destination.route == ModalRoute) {
                    ExitTransition.KeepUntilTransitionsFinished
                } else {
                    fadeOut(tween(300))
                }
            },
            popEnterTransition = { EnterTransition.None },
            popExitTransition = { slideOutVertically(modalMotion) { fullHeight -> fullHeight } },
        ) { entry ->
            CompositionLocalProvider(LocalModalPresentation provides true) {
                ScreenDestination(entry, navController, navigator)
            }
        }
    }
}

private val modalMotion = tween<IntOffset>(durationMillis = 350, easing = FastOutSlowInEasing)

@Composable
private fun ScreenDestination(
    entry: NavBackStackEntry,
    navController: NavHostController,
    navigator: AppNavigator,
) {
    val name = entry.arguments?.getString("name")?.takeIf { it.isNotBlank() } ?: return
    val encodedContext = entry.arguments?.getString("context").orEmpty()
    val parameters = if (encodedContext.isBlank()) {
        emptyMap()
    } else {
        Deeplink.decodeParameters(encodedContext)
    }
    val url = NShiftAppConfiguration.current.runtimeScreenURL(name, parameters)
    val preloaded = remember(entry.id) {
        navigator.consumePreloaded(name, parameters)
    }
    val isRoot = navController.currentBackStack.value
        .firstOrNull { it.destination.route == ScreenRoute }
        ?.id == entry.id
    val onBack: (() -> Unit)? = if (isRoot) {
        null
    } else {
        { navController.popBackStack() }
    }
    val builder = Screen()
        .url(url)
        .routeParameters(parameters)
        .title(name)
        .let { base -> preloaded?.let(base::preloaded) ?: base }
    if (isRoot && preloaded == null) {
        builder.startup(onBack)
    } else {
        builder.resolve(onBack)
    }
}
