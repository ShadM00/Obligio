package com.compliancecalendar

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.clerk.api.Clerk

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(ObligioAuthPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    Clerk.initialize(applicationContext, "pk_live_Y2xlcmsub2JsaWdpby5jb20k")
    loadReactNative(this)
  }
}
