package com.nshiftui.poc.navigation

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
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
import com.nshiftui.poc.sdui.plugandplay.Screen
import com.nshiftui.poc.theme.LocalSCNTheme

private const val ScreenRoute = "screen/{name}"

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
        exitTransition = { slideOutHorizontally(motion) { fullWidth -> -fullWidth / 5 } },
        popEnterTransition = { slideInHorizontally(motion) { fullWidth -> -fullWidth / 5 } },
        popExitTransition = { slideOutHorizontally(motion) { fullWidth -> fullWidth } },
    ) {
        composable(
            route = ScreenRoute,
            arguments = listOf(navArgument("name") { type = NavType.StringType }),
        ) { entry ->
            ScreenDestination(entry, navController, navigator)
        }
    }
}

@Composable
private fun ScreenDestination(
    entry: NavBackStackEntry,
    navController: NavHostController,
    navigator: AppNavigator,
) {
    val name = entry.arguments?.getString("name")?.takeIf { it.isNotBlank() } ?: return
    val url = NShiftAppConfiguration.current.runtimeScreenURL(name)
    val preloaded = remember(entry.id) { navigator.consumePreloaded(name) }
    val isRoot = navController.currentBackStack.value
        .firstOrNull { it.destination.route == ScreenRoute }
        ?.id == entry.id
    val onBack: (() -> Unit)? = if (isRoot) {
        null
    } else {
        { navController.popBackStack() }
    }
    val builder = Screen().url(url).title(name).let { base ->
        preloaded?.let(base::preloaded) ?: base
    }
    if (isRoot && preloaded == null) {
        builder.startup(onBack)
    } else {
        builder.resolve(onBack)
    }
}
