package com.nomadlink.wifi

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.p2p.*
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NomadWifiDirectModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), WifiP2pManager.ChannelListener {

    companion object {
        const val NAME = "NomadWifiDirectModule"
        private const val TAG = "NomadWifiDirect"
    }

    private val wifiP2pManager: WifiP2pManager? by lazy {
        reactContext.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
    }
    private var channel: WifiP2pManager.Channel? = null
    private var isReceiverRegistered = false

    override fun getName(): String = NAME

    override fun initialize() {
        super.initialize()
        channel = wifiP2pManager?.initialize(reactContext, reactContext.mainLooper, this)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onChannelDisconnected() {
        Log.w(TAG, "Wi-Fi Direct channel disconnected. Reinitializing...")
        channel = wifiP2pManager?.initialize(reactContext, reactContext.mainLooper, this)
    }

    @ReactMethod
    fun discoverWifiDirectPeers(promise: Promise) {
        val mgr = wifiP2pManager
        val ch = channel
        if (mgr == null || ch == null) {
            promise.reject("WIFI_DIRECT_UNAVAILABLE", "Wi-Fi Direct is not supported on this device")
            return
        }

        mgr.discoverPeers(ch, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                promise.resolve(true)
            }

            override fun onFailure(reasonCode: Int) {
                promise.reject("DISCOVERY_FAILED", "Wi-Fi Direct peer discovery failed reason: $reasonCode")
            }
        })
    }

    @ReactMethod
    fun connectWifiDirectPeer(deviceAddress: String, promise: Promise) {
        val mgr = wifiP2pManager
        val ch = channel
        if (mgr == null || ch == null) {
            promise.reject("WIFI_DIRECT_UNAVAILABLE", "Wi-Fi Direct is not supported")
            return
        }

        val config = WifiP2pConfig().apply {
            this.deviceAddress = deviceAddress
        }

        mgr.connect(ch, config, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                promise.resolve(true)
            }

            override fun onFailure(reasonCode: Int) {
                promise.reject("CONNECT_FAILED", "Failed to initiate Wi-Fi Direct connection code: $reasonCode")
            }
        })
    }
}
