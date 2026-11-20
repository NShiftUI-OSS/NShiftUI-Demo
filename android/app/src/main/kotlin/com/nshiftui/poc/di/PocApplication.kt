package com.nshiftui.poc.di

import android.app.Application
import com.nshiftui.NShiftConfig
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class PocApplication : Application() {
    override fun onCreate() {
        super.onCreate()
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
