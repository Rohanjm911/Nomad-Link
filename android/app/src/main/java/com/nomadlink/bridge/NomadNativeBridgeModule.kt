package com.nomadlink.bridge

import android.content.Context
import android.content.Intent
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.facebook.react.bridge.*
import com.nomadlink.services.NomadForegroundService
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class NomadNativeBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NomadLinkNativeBridge"
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val KEY_ALIAS_PREFIX = "NomadIdentity_"
        private const val AES_GCM_TRANSFORMATION = "AES/GCM/NoPadding"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun startExpeditionForegroundService(title: String, text: String, promise: Promise) {
        try {
            val intent = Intent(reactContext, NomadForegroundService::class.java).apply {
                action = NomadForegroundService.ACTION_START
                putExtra(NomadForegroundService.EXTRA_TITLE, title)
                putExtra(NomadForegroundService.EXTRA_TEXT, text)
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_START_FAILED", e.localizedMessage)
        }
    }

    @ReactMethod
    fun stopExpeditionForegroundService(promise: Promise) {
        try {
            val intent = Intent(reactContext, NomadForegroundService::class.java).apply {
                action = NomadForegroundService.ACTION_STOP
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVICE_STOP_FAILED", e.localizedMessage)
        }
    }

    @ReactMethod
    fun storeKeyInKeystore(alias: String, secretHex: String, promise: Promise) {
        try {
            val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
            val fullAlias = KEY_ALIAS_PREFIX + alias

            if (!keyStore.containsAlias(fullAlias)) {
                val keyGen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
                keyGen.init(
                    KeyGenParameterSpec.Builder(
                        fullAlias,
                        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                    )
                        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                        .setKeySize(256)
                        .build()
                )
                keyGen.generateKey()
            }

            val secretKey = keyStore.getKey(fullAlias, null) as SecretKey
            val cipher = Cipher.getInstance(AES_GCM_TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            val iv = cipher.iv
            val encryptedBytes = cipher.doFinal(secretHex.toByteArray(Charsets.UTF_8))

            val prefs = reactContext.getSharedPreferences("nomad_secure_vault", Context.MODE_PRIVATE)
            val combined = Base64.encodeToString(iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(encryptedBytes, Base64.NO_WRAP)
            prefs.edit().putString(fullAlias, combined).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("KEYSTORE_STORE_ERROR", e.localizedMessage)
        }
    }

    @ReactMethod
    fun getKeyFromKeystore(alias: String, promise: Promise) {
        try {
            val fullAlias = KEY_ALIAS_PREFIX + alias
            val prefs = reactContext.getSharedPreferences("nomad_secure_vault", Context.MODE_PRIVATE)
            val combined = prefs.getString(fullAlias, null)

            if (combined == null) {
                promise.resolve(null)
                return
            }

            val parts = combined.split(":")
            val iv = Base64.decode(parts[0], Base64.NO_WRAP)
            val encryptedBytes = Base64.decode(parts[1], Base64.NO_WRAP)

            val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
            val secretKey = keyStore.getKey(fullAlias, null) as SecretKey

            val cipher = Cipher.getInstance(AES_GCM_TRANSFORMATION)
            val spec = GCMParameterSpec(128, iv)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            val decryptedBytes = cipher.doFinal(encryptedBytes)

            promise.resolve(String(decryptedBytes, Charsets.UTF_8))
        } catch (e: Exception) {
            promise.reject("KEYSTORE_RETRIEVE_ERROR", e.localizedMessage)
        }
    }
}
