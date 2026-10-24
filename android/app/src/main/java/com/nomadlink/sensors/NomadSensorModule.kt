package com.nomadlink.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NomadSensorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), SensorEventListener {

    companion object {
        const val NAME = "NomadSensorModule"
    }

    private val sensorManager: SensorManager? by lazy {
        reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    }

    private var accelerometer: Sensor? = null
    private var gyroscope: Sensor? = null
    private var magnetometer: Sensor? = null

    private val gravityValues = FloatArray(3)
    private val geomagneticValues = FloatArray(3)
    private val gyroValues = FloatArray(3)
    private var isStreaming = false

    override fun getName(): String = NAME

    override fun initialize() {
        super.initialize()
        sensorManager?.let { mgr ->
            accelerometer = mgr.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            gyroscope = mgr.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
            magnetometer = mgr.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startSensorStream(promise: Promise) {
        val mgr = sensorManager
        if (mgr == null) {
            promise.reject("SENSORS_UNAVAILABLE", "Hardware sensor manager not found")
            return
        }

        accelerometer?.let { mgr.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        gyroscope?.let { mgr.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        magnetometer?.let { mgr.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }

        isStreaming = true
        promise.resolve(true)
    }

    @ReactMethod
    fun stopSensorStream(promise: Promise) {
        sensorManager?.unregisterListener(this)
        isStreaming = false
        promise.resolve(true)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event ?: return

        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(event.values, 0, gravityValues, 0, 3)
            }
            Sensor.TYPE_GYROSCOPE -> {
                System.arraycopy(event.values, 0, gyroValues, 0, 3)
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                System.arraycopy(event.values, 0, geomagneticValues, 0, 3)
            }
        }

        
        val rotationMatrix = FloatArray(9)
        val orientationAngles = FloatArray(3)
        var azimuthDeg = 0f

        if (SensorManager.getRotationMatrix(rotationMatrix, null, gravityValues, geomagneticValues)) {
            SensorManager.getOrientation(rotationMatrix, orientationAngles)
            azimuthDeg = Math.toDegrees(orientationAngles[0].toDouble()).toFloat()
            if (azimuthDeg < 0) azimuthDeg += 360f
        }

        val params = Arguments.createMap().apply {
            putDouble("timestamp", System.currentTimeMillis().toDouble())
            putDouble("accelX", gravityValues[0].toDouble())
            putDouble("accelY", gravityValues[1].toDouble())
            putDouble("accelZ", gravityValues[2].toDouble())
            putDouble("gyroX", gyroValues[0].toDouble())
            putDouble("gyroY", gyroValues[1].toDouble())
            putDouble("gyroZ", gyroValues[2].toDouble())
            putDouble("azimuthDeg", azimuthDeg.toDouble())
        }

        sendEvent("onSensorData", params)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
