package com.compliancecalendar

import com.facebook.react.bridge.*
import com.google.android.gms.wearable.*
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

class ObligioWatchModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "ObligioWatch"
  companion object {
    var snapshot = "{}"
    val actions = ConcurrentLinkedQueue<JSONObject>()
    val replyNodes = ConcurrentHashMap<String, String>()
  }
  @ReactMethod fun updateSnapshot(json: String, promise: Promise) {
    snapshot = json
    val request = PutDataMapRequest.create("/obligio/snapshot")
    request.dataMap.putString("snapshot", json)
    Wearable.getDataClient(context).putDataItem(request.asPutDataRequest().setUrgent())
      .addOnSuccessListener { promise.resolve(null) }
      .addOnFailureListener { promise.reject("watch_sync", it) }
  }
  @ReactMethod fun pendingActions(promise: Promise) {
    val result = Arguments.createArray()
    while (true) {
      val item = actions.poll() ?: break
      val row = Arguments.createMap()
      for (key in listOf("requestId", "ownerId", "businessId", "requirementId")) row.putString(key, item.optString(key))
      result.pushMap(row)
    }
    promise.resolve(result)
  }
  @ReactMethod fun reply(requestId: String, error: String?, promise: Promise) {
    val node = replyNodes.remove(requestId)
    if (node == null) { promise.resolve(null); return }
    val json = JSONObject().put("requestId", requestId).put("error", error ?: "").toString()
    Wearable.getMessageClient(context).sendMessage(node, "/obligio/result", json.toByteArray(Charsets.UTF_8))
      .addOnSuccessListener { promise.resolve(null) }
      .addOnFailureListener { promise.reject("watch_reply", it) }
  }
}

class ObligioWatchService : WearableListenerService() {
  override fun onMessageReceived(event: MessageEvent) {
    if (event.path != "/obligio/action") return
    val message = try { JSONObject(String(event.data, Charsets.UTF_8)) } catch (_: Exception) { return }
    val requestId = message.optString("requestId")
    if (requestId.isEmpty()) return
    if (message.optString("action") == "refresh") {
      val result = JSONObject().put("requestId", requestId).put("snapshot", ObligioWatchModule.snapshot)
      Wearable.getMessageClient(this).sendMessage(event.sourceNodeId, "/obligio/result", result.toString().toByteArray(Charsets.UTF_8))
      return
    }
    if (message.optString("action") != "complete" || ObligioWatchModule.replyNodes.size >= 10) return
    if (ObligioWatchModule.replyNodes.putIfAbsent(requestId, event.sourceNodeId) != null) return
    ObligioWatchModule.actions.add(message)
    android.os.Handler(mainLooper).postDelayed({
      ObligioWatchModule.actions.remove(message)
      val node = ObligioWatchModule.replyNodes.remove(requestId)
      if (node != null) {
        val result = JSONObject().put("requestId", requestId).put("error", "Open Obligio on your phone, refresh, then try again.")
        Wearable.getMessageClient(this).sendMessage(node, "/obligio/result", result.toString().toByteArray(Charsets.UTF_8))
      }
    }, 25000)
  }
}

class ObligioPreferencesModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val preferences = context.getSharedPreferences("obligio.preferences", 0)
  override fun getName() = "ObligioPreferences"
  override fun getConstants(): MutableMap<String, Any> = mutableMapOf("locale" to (preferences.getString("locale", "") ?: ""))
  @ReactMethod fun setLocale(locale: String) {
    if (locale in listOf("en-US", "en-GB", "es-US", "fr-CA")) preferences.edit().putString("locale", locale).apply()
  }
}
