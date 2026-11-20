package com.nshiftui.poc.di

import com.nshiftui.NShiftDependencyContainer
import com.nshiftui.NShiftDependencyScope
import org.koin.core.Koin
import org.koin.core.parameter.parametersOf
import org.koin.core.qualifier.named
import org.koin.dsl.module
import kotlin.reflect.KClass

class KoinNShiftContainer(
    private val koin: Koin,
) : NShiftDependencyContainer {
    override fun <Service : Any> register(
        serviceType: KClass<Service>,
        name: String?,
        scope: NShiftDependencyScope,
        argumentTypes: List<KClass<*>>,
        factory: (List<Any>) -> Service?,
    ) {
        val key = registrationKey(serviceType, name, argumentTypes)
        val definition = module {
            when (scope) {
                NShiftDependencyScope.Singleton ->
                    single<KoinNShiftBox>(named(key)) { params ->
                        KoinNShiftBox(factory(argumentList(params.values)))
                    }
                NShiftDependencyScope.Transient ->
                    factory<KoinNShiftBox>(named(key)) { params ->
                        KoinNShiftBox(factory(argumentList(params.values)))
                    }
            }
        }
        koin.loadModules(listOf(definition), allowOverride = true)
    }

    override fun <Service : Any> resolve(
        serviceType: KClass<Service>,
        name: String?,
        argumentTypes: List<KClass<*>>,
        arguments: List<Any>,
    ): Service? {
        val key = registrationKey(serviceType, name, argumentTypes)
        val resolved = koin.getOrNull<KoinNShiftBox>(named(key)) {
            parametersOf(*arguments.toTypedArray())
        } ?: return null
        @Suppress("UNCHECKED_CAST")
        return resolved.value as? Service
    }

    private fun registrationKey(
        service: KClass<*>,
        name: String?,
        argumentTypes: List<KClass<*>>,
    ): String {
        val arguments = argumentTypes.joinToString(",") { type ->
            type.qualifiedName ?: type.toString()
        }
        val serviceName = service.qualifiedName ?: service.toString()
        return "$serviceName|${name.orEmpty()}|$arguments"
    }

    private fun argumentList(values: List<Any?>): List<Any> =
        values.map { value ->
            checkNotNull(value) { "NShift resolve arguments are non-null." }
        }
}

private class KoinNShiftBox(
    val value: Any?,
)
