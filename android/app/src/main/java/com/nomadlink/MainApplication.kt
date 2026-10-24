package com.nomadlink

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.uimanager.ViewManager
import com.facebook.soloader.SoLoader
import com.nomadlink.bluetooth.NomadBleModule
import com.nomadlink.bridge.NomadNativeBridgeModule
import com.nomadlink.sensors.NomadSensorModule
import com.nomadlink.wifi.NomadWifiDirectModule
import java.util.Collections

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Add custom NOMAD LINK native modules
                    add(object : ReactPackage {
                        override fun createNativeModules(
                            reactContext: ReactApplicationContext
                        ): List<NativeModule> = listOf(
                            NomadBleModule(reactContext),
                            NomadWifiDirectModule(reactContext),
                            NomadSensorModule(reactContext),
                            NomadNativeBridgeModule(reactContext)
                        )

                        override fun createViewManagers(
                            reactContext: ReactApplicationContext
                        ): List<ViewManager<*, *>> = Collections.emptyList()
                    })
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            // Old Architecture: disabled (set to false)
            // To enable New Architecture, set to true and run RN codegen
            override val isNewArchEnabled: Boolean = false
            override val isHermesEnabled: Boolean = true
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
    }
}
