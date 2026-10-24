package com.nomadlink

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript.
     * Must match AppRegistry.registerComponent() call in index.js.
     */
    override fun getMainComponentName(): String = "nomad-link"

    /**
     * ReactActivityDelegate is required in RN 0.76.
     * DefaultReactActivityDelegate handles both Old and New Architecture.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
