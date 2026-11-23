import java.io.File

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.nshiftui.poc"
    compileSdk {
        version = release(37) {
            minorApiLevel = 0
        }
    }

    defaultConfig {
        applicationId = "com.nshiftui.poc"
        minSdk = 23
        targetSdk = 37
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2026.09.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation("androidx.navigation:navigation-compose:2.9.3")
    implementation("com.nshiftui:nshiftui:1.0.0:release@aar")
    implementation("com.nshiftui.rainbowparser:rainbowparser:1.0.0:release@aar")
    implementation("io.insert-koin:koin-android:4.1.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
    ksp("com.nshiftui:nshiftui-ksp:1.0.0@jar")
    debugImplementation("androidx.compose.ui:ui-tooling")
}

val localCertificateDirectory = System.getenv("NSHIFTUI_LOCAL_CERT_DIR")
    ?.let(::File)
    ?: run {
        val home = System.getProperty("user.home")
        val os = System.getProperty("os.name").lowercase()
        val root = when {
            os.contains("win") -> System.getenv("LOCALAPPDATA")
                ?.let(::File)
                ?: File(home, "AppData/Local")
            os.contains("mac") -> File(home, "Library/Application Support")
            else -> System.getenv("XDG_DATA_HOME")
                ?.let(::File)
                ?: File(home, ".local/share")
        }
        File(root, "NShiftUI/local-certs")
    }
val localHttpsResources = layout.buildDirectory
    .dir("generated/res/local-https")
    .get()
    .asFile
val syncLocalHttpsCertificate = tasks.register<Copy>("syncLocalHttpsCertificate") {
    val certificate = File(localCertificateDirectory, "local-ca.crt")
    doFirst {
        if (!certificate.isFile) {
            throw GradleException(
                "Missing $certificate. Run npm run setup:local-https in CMS-BACK.",
            )
        }
    }
    from(certificate)
    into(File(localHttpsResources, "raw"))
    rename { "nshift_local_ca.pem" }
}
android.sourceSets.getByName("main").res.directories.add(localHttpsResources.absolutePath)
tasks.named("preBuild") {
    dependsOn(syncLocalHttpsCertificate)
}
