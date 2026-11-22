package com.nshiftui.poc.navigation

import android.app.Activity
import java.lang.ref.WeakReference

/** Lets `CloseAppEvent` finish the running activity without holding it strongly. */
object AppCloser {
    private var activity: WeakReference<Activity>? = null

    fun attach(activity: Activity) {
        this.activity = WeakReference(activity)
    }

    fun detach(activity: Activity) {
        if (this.activity?.get() === activity) this.activity = null
    }

    fun close() {
        activity?.get()?.finishAndRemoveTask()
    }
}
