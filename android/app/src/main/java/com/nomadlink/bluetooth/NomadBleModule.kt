package com.nomadlink.bluetooth

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*

class NomadBleModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NomadBleModule"
        private const val TAG = "NomadBle"
        val NOMAD_SERVICE_UUID: UUID = UUID.fromString("0000FE60-0000-1000-8000-00805F9B34FB")
        val NOMAD_CHAR_TX_UUID: UUID = UUID.fromString("0000FE61-0000-1000-8000-00805F9B34FB")
        val NOMAD_CHAR_RX_UUID: UUID = UUID.fromString("0000FE62-0000-1000-8000-00805F9B34FB")
    }

    private val bluetoothManager: BluetoothManager? by lazy {
        reactContext.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    }
    private val bluetoothAdapter: BluetoothAdapter? by lazy { bluetoothManager?.adapter }
    
    private var advertiser: BluetoothLeAdvertiser? = null
    private var scanner: BluetoothLeScanner? = null
    private var gattServer: BluetoothGattServer? = null

    private var isScanning = false
    private var isAdvertising = false

    override fun getName(): String = NAME

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startBleAdvertising(alias: String, promise: Promise) {
        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            promise.reject("BLE_DISABLED", "Bluetooth adapter is disabled or unavailable")
            return
        }

        advertiser = adapter.bluetoothLeAdvertiser
        if (advertiser == null) {
            promise.reject("BLE_NO_ADV", "Device does not support BLE Peripheral advertising")
            return
        }

        try {
            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
                .setConnectable(true)
                .setTimeout(0)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceUuid(ParcelUuid(NOMAD_SERVICE_UUID))
                
                .addServiceData(ParcelUuid(NOMAD_SERVICE_UUID), alias.take(8).toByteArray(Charsets.UTF_8))
                .build()

            advertiser?.startAdvertising(settings, data, advertiseCallback)
            isAdvertising = true
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting BLE advertising", e)
            promise.reject("BLE_ADV_ERROR", e.localizedMessage)
        }
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            Log.i(TAG, "BLE advertising successfully started")
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e(TAG, "BLE advertising failed with code $errorCode")
            isAdvertising = false
        }
    }

    @ReactMethod
    fun stopBleAdvertising(promise: Promise) {
        try {
            advertiser?.stopAdvertising(advertiseCallback)
            isAdvertising = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("BLE_ADV_STOP_ERROR", e.localizedMessage)
        }
    }

    @ReactMethod
    fun startBleScanning(promise: Promise) {
        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            promise.reject("BLE_DISABLED", "Bluetooth adapter is disabled or unavailable")
            return
        }

        scanner = adapter.bluetoothLeScanner
        if (scanner == null) {
            promise.reject("BLE_NO_SCANNER", "BLE Scanner is unavailable")
            return
        }

        try {
            val filter = ScanFilter.Builder()
                .setServiceUuid(ParcelUuid(NOMAD_SERVICE_UUID))
                .build()

            val scanSettings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .setCallbackType(ScanSettings.CALLBACK_TYPE_ALL_MATCHES)
                .build()

            scanner?.startScan(listOf(filter), scanSettings, scanCallback)
            isScanning = true
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting BLE scan", e)
            promise.reject("BLE_SCAN_ERROR", e.localizedMessage)
        }
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result ?: return
            val record = result.scanRecord ?: return
            val rawServiceData = record.getServiceData(ParcelUuid(NOMAD_SERVICE_UUID)) ?: byteArrayOf()
            val alias = if (rawServiceData.isNotEmpty()) String(rawServiceData, Charsets.UTF_8) else "NomadPeer"

            val params = Arguments.createMap().apply {
                putString("peerId", result.device.address.replace(":", "").lowercase())
                putString("alias", alias)
                putInt("rssi", result.rssi)
                putString("transportType", "BLE")
                putDouble("lastSeenMs", System.currentTimeMillis().toDouble())
            }

            sendEvent("onPeerDiscovered", params)
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "BLE scan failed code: $errorCode")
            isScanning = false
        }
    }

    @ReactMethod
    fun stopBleScanning(promise: Promise) {
        try {
            scanner?.stopScan(scanCallback)
            isScanning = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("BLE_SCAN_STOP_ERROR", e.localizedMessage)
        }
    }
}
