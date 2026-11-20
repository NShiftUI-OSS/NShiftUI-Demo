package com.nshiftui.poc.di

import com.nshiftui.NShiftDependencyAssembly
import com.nshiftui.NShiftDependencyContainer
import com.nshiftui.generated.installNShiftGenerated

class CatalogAssembly : NShiftDependencyAssembly() {
    override fun assemblePlugins(container: NShiftDependencyContainer) {
        container.installNShiftGenerated()
    }
}
