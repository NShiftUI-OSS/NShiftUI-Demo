package com.nshiftui.poc.di

import android.app.Application
import com.nshiftui.NShiftConfig
import com.nshiftui.poc.theme.SCNAppTheme
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class PocApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        SCNAppTheme.install(this)
        val koin = startKoin {
            androidContext(this@PocApplication)
        }.koin
        NShiftConfig.shared.startup(
            hostContainer = KoinNShiftContainer(koin),
            assemblies = listOf(
                ServicesAssembly(),
                CatalogAssembly(),
            ),
        )
    }
}
