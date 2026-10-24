package com.nomadlink.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class NomadForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "NomadLink_Expedition_Channel"
        const val NOTIFICATION_ID = 9001
        const val ACTION_START = "com.nomadlink.action.START_EXPEDITION"
        const val ACTION_STOP = "com.nomadlink.action.STOP_EXPEDITION"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_TEXT = "extra_text"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
            else -> {
                val title = intent?.getStringExtra(EXTRA_TITLE) ?: "NOMAD LINK Active"
                val text = intent?.getStringExtra(EXTRA_TEXT) ?: "BLE & Mesh Relay operating in background"

                val notification = NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setSmallIcon(android.R.drawable.stat_notify_sync)
                    .setOngoing(true)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setCategory(NotificationCompat.CATEGORY_SERVICE)
                    .build()

                startForeground(NOTIFICATION_ID, notification)
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Nomad Link Background Mesh Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Maintains BLE radio discovery and store-and-forward mesh routing while screen is off"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.createNotificationChannel(channel)
        }
    }
}
