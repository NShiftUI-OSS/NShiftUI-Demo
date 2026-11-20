package com.nshiftui.poc.di

import com.nshiftui.NShiftDependencyAssembly
import com.nshiftui.NShiftDependencyContainer
import com.nshiftui.NShiftDependencyScope
import com.nshiftui.poc.domain.protocols.FetchScreenUseCaseProtocol
import com.nshiftui.poc.domain.protocols.ScreenServiceProtocol
import com.nshiftui.poc.domain.protocols.SendHTTPRequestServiceProtocol
import com.nshiftui.poc.domain.protocols.SendHTTPRequestUseCaseProtocol
import com.nshiftui.poc.domain.usecases.FetchScreenUseCase
import com.nshiftui.poc.domain.usecases.SendHTTPRequestUseCase
import com.nshiftui.poc.navigation.AppNavigator
import com.nshiftui.poc.config.NShiftAppConfiguration
import com.nshiftui.poc.network.APIClient
import com.nshiftui.poc.services.services.ScreenService
import com.nshiftui.poc.services.services.SendHTTPRequestService
import com.nshiftui.poc.sdui.plugins.scn.screen.ScreenViewModel
import com.nshiftui.resolveOrThrow

class ServicesAssembly : NShiftDependencyAssembly() {
    private val configuration = NShiftAppConfiguration.current

    override fun assemblePlugins(container: NShiftDependencyContainer) {
        container.register(
            serviceType = APIClient::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            APIClient(baseURL = configuration.backendBaseURL)
        }
        container.register(
            serviceType = AppNavigator::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            AppNavigator()
        }
        container.register(
            serviceType = ScreenServiceProtocol::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            ScreenService(container.resolveOrThrow())
        }
        container.register(
            serviceType = FetchScreenUseCaseProtocol::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            FetchScreenUseCase(container.resolveOrThrow())
        }
        container.register(
            serviceType = SendHTTPRequestServiceProtocol::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            SendHTTPRequestService(container.resolveOrThrow())
        }
        container.register(
            serviceType = SendHTTPRequestUseCaseProtocol::class,
            scope = NShiftDependencyScope.Singleton,
        ) {
            SendHTTPRequestUseCase(container.resolveOrThrow())
        }
        container.register(
            serviceType = ScreenViewModel::class,
            scope = NShiftDependencyScope.Transient,
        ) {
            ScreenViewModel(container.resolveOrThrow())
        }
    }
}
