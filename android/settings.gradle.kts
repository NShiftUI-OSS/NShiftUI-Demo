pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        exclusiveContent {
            forRepository {
                ivy {
                    url = uri(
                        "https://github.com/NShiftUI-OSS/NShiftUI-Android/releases/download",
                    )
                    patternLayout {
                        artifact("v[revision]/NShiftUI-Android-[classifier].[ext]")
                    }
                    metadataSources { artifact() }
                }
            }
            filter { includeModule("com.nshiftui", "nshiftui") }
        }
        exclusiveContent {
            forRepository {
                ivy {
                    url = uri(
                        "https://github.com/NShiftUI-OSS/NShiftUI-Android/releases/download",
                    )
                    patternLayout {
                        artifact("v[revision]/nshiftui-ksp.[ext]")
                    }
                    metadataSources { artifact() }
                }
            }
            filter { includeModule("com.nshiftui", "nshiftui-ksp") }
        }
        exclusiveContent {
            forRepository {
                ivy {
                    url = uri(
                        "https://github.com/NShiftUI-OSS/RainbowParser-Android/releases/download",
                    )
                    patternLayout {
                        artifact("v[revision]/RainbowParser-Android-[classifier].[ext]")
                    }
                    metadataSources { artifact() }
                }
            }
            filter { includeGroup("com.nshiftui.rainbowparser") }
        }
    }
}

rootProject.name = "NShiftUI-Android-POC"
include(":app")
