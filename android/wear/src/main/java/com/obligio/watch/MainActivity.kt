package com.obligio.watch

import android.app.Activity
import android.app.AlertDialog
import android.content.pm.ApplicationInfo
import android.util.Base64
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.graphics.Color
import android.view.Gravity
import android.widget.*
import com.google.android.gms.wearable.*
import org.json.JSONObject
import java.text.DateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class MainActivity : Activity(), DataClient.OnDataChangedListener, MessageClient.OnMessageReceivedListener {
  private var snapshot = JSONObject()
  private var phoneNode: String? = null
  private var pending: String? = null
  private var completing: String? = null
  private var selected: String? = null
  private var fixture = false
  private val handler = Handler(Looper.getMainLooper())
  private val mint = Color.rgb(140, 214, 180)

  /**
   * The watch speaks the language the owner chose in the phone app, which the
   * phone sends with each snapshot. This English is only for a watch that has
   * never synced.
   */
  private val fallback = mapOf(
    "title" to "Obligio", "deadline" to "Deadline", "lastSynced" to "Last synced {time}",
    "noObligations" to "No obligations yet. Add one on your phone.",
    "signInOnPhone" to "Open Obligio on your phone and sign in to sync your obligations.",
    "refresh" to "Refresh", "connecting" to "Connecting…", "markComplete" to "Mark complete",
    "saving" to "Saving…", "confirmTitle" to "Complete this obligation?", "complete" to "Complete",
    "cancel" to "Cancel", "ok" to "OK", "back" to "Back", "completedStatus" to "Completed",
    "completedFeedback" to "Completed. Your phone will sync the next deadline if this obligation repeats.",
    "openPhone" to "Open Obligio on your paired phone and keep it nearby.",
    "phoneUnavailable" to "Phone unavailable. Open Obligio on your phone and try again.",
    "noReply" to "No reply. Refresh before retrying to check whether the item completed.",
  )
  private fun s(key: String): String =
    snapshot.optJSONObject("strings")?.optString(key)?.takeIf { it.isNotEmpty() } ?: fallback[key] ?: key
  private fun snapshotLocale(): Locale = Locale.forLanguageTag(snapshot.optString("locale").ifEmpty { "en-US" })
  override fun onCreate(state: Bundle?) {
    super.onCreate(state)
    // Store screenshots: show sample data the phone's own code produced
    // (scripts/watch-fixtures) instead of waiting for a paired phone. Base64,
    // because `adb shell am start` mangles quotes and accents. Ignored by any
    // build that is not debuggable.
    if ((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
      intent.getStringExtra("fixture64")?.let { encoded ->
        snapshot = JSONObject(String(Base64.decode(encoded, Base64.DEFAULT), Charsets.UTF_8))
        selected = intent.getStringExtra("open")
        fixture = true
      }
    }
    render()
  }
  override fun onResume() {
    super.onResume()
    if (fixture) return
    Wearable.getDataClient(this).addListener(this)
    Wearable.getMessageClient(this).addListener(this)
    Wearable.getDataClient(this).dataItems.addOnSuccessListener { buffer ->
      try { for (item in buffer) accept(item) } finally { buffer.release() }
    }.addOnFailureListener { notice(s("openPhone")) }
  }
  override fun onPause() {
    if (fixture) { super.onPause(); return }
    Wearable.getDataClient(this).removeListener(this)
    Wearable.getMessageClient(this).removeListener(this)
    super.onPause()
  }
  private fun accept(item: DataItem) {
    if (item.uri.path != "/obligio/snapshot") return
    val json = DataMapItem.fromDataItem(item).dataMap.getString("snapshot") ?: return
    val value = try { JSONObject(json) } catch (_: Exception) { return }
    if (value.optLong("updatedAt") < snapshot.optLong("updatedAt")) return
    snapshot = value
    phoneNode = item.uri.host
    runOnUiThread { render() }
  }
  override fun onDataChanged(events: DataEventBuffer) { for (event in events) if (event.type == DataEvent.TYPE_CHANGED) accept(event.dataItem) }
  override fun onMessageReceived(event: MessageEvent) {
    if (event.path != "/obligio/result" || event.sourceNodeId != phoneNode) return
    val value = try { JSONObject(String(event.data, Charsets.UTF_8)) } catch (_: Exception) { return }
    runOnUiThread {
      if (value.optString("requestId") != pending) return@runOnUiThread
      pending = null
      val error = value.optString("error")
      if (error.isNotEmpty()) notice(error)
      else if (completing != null) {
        val items = snapshot.optJSONArray("items")
        if (items != null) for (i in 0 until items.length()) {
          val item = items.getJSONObject(i)
          if (item.optString("id") == completing) item.put("status", "current")
        }
        notice(s("completedFeedback"))
      } else if (value.has("snapshot")) {
        val fresh = try { JSONObject(value.getString("snapshot")) } catch (_: Exception) { JSONObject() }
        if (fresh.has("version")) snapshot = fresh
        else notice(s("openPhone"))
      }
      completing = null
      render()
    }
  }
  private fun send(action: String, itemId: String? = null) {
    if (pending != null) return
    val node = phoneNode
    if (node == null) { notice(s("openPhone")); return }
    val id = UUID.randomUUID().toString()
    pending = id
    completing = itemId
    val request = JSONObject().put("action", action).put("requestId", id)
      .put("ownerId", snapshot.optString("ownerId")).put("businessId", snapshot.optString("businessId"))
      .put("requirementId", itemId ?: "")
    render()
    Wearable.getMessageClient(this).sendMessage(node, "/obligio/action", request.toString().toByteArray(Charsets.UTF_8))
      .addOnFailureListener {
        pending = null; completing = null; render()
        notice(s("phoneUnavailable"))
      }
    handler.postDelayed({
      if (pending == id) {
        pending = null; completing = null; render()
        notice(s("noReply"))
      }
    }, 30000)
  }
  private fun notice(text: String) { if (!isFinishing) AlertDialog.Builder(this).setTitle(s("title")).setMessage(text).setPositiveButton(s("ok"), null).show() }
  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
  private fun render() {
    val scroll = ScrollView(this)
    val column = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(24), dp(28), dp(24), dp(36))
    }
    fun text(value: String, size: Float = 14f, color: Int = Color.WHITE) {
      column.addView(TextView(this).apply {
        this.text = value; textSize = size; setTextColor(color); gravity = Gravity.CENTER
        setPadding(0, dp(5), 0, dp(5))
      })
    }
    fun button(label: String, enabled: Boolean = true, click: () -> Unit) {
      column.addView(Button(this).apply {
        this.text = label; isAllCaps = false; minHeight = dp(48); setTextColor(mint)
        isEnabled = enabled; setOnClickListener { click() }
      }, LinearLayout.LayoutParams(-1, -2))
    }
    text(s("title"), 22f, mint)
    val items = snapshot.optJSONArray("items")
    val detail = if (items != null) (0 until items.length()).map { items.getJSONObject(it) }.firstOrNull { it.optString("id") == selected } else null
    if (selected != null && detail != null) {
      text(detail.optString("title"), 18f)
      text(detail.optString("dueLabel").ifEmpty { "Due ${detail.optString("dueDate")}" })
      if (detail.optString("recurrence").isNotEmpty()) {
        text(detail.optString("repeatsLabel").ifEmpty { "Repeats ${detail.optString("recurrence")}" })
      }
      if (detail.optString("status") == "current") text("✓ ${s("completedStatus")}", 16f, mint)
      else button(if (pending != null) s("saving") else s("markComplete"), pending == null) {
        AlertDialog.Builder(this).setTitle(s("confirmTitle"))
          .setPositiveButton(s("complete")) { _, _ -> send("complete", detail.getString("id")) }
          .setNegativeButton(s("cancel"), null).show()
      }
      button(s("back")) { selected = null; render() }
    } else if (snapshot.optString("ownerId").isNotEmpty()) {
      text(snapshot.optString("businessName"), 16f)
      val time = DateFormat.getTimeInstance(DateFormat.SHORT, snapshotLocale()).format(Date(snapshot.optLong("updatedAt")))
      text(s("lastSynced").replace("{time}", time), 12f, Color.LTGRAY)
      snapshot.optString("truncationNote").takeIf { it.isNotEmpty() }?.let { text(it, 12f) }
      if (items == null || items.length() == 0) text(s("noObligations"))
      // The phone sends items already ordered: open deadlines by date, completed last.
      else (0 until items.length()).map { items.getJSONObject(it) }.forEach { item ->
        val subtitle = if (item.optString("status") == "current") "✓ ${s("completedStatus")}"
          else item.optString("dueLabel").ifEmpty { item.optString("dueDate") }
        button("${item.optString("title")}\n$subtitle") { selected = item.optString("id"); render() }
      }
    } else text(s("signInOnPhone"))
    button(if (pending != null) s("connecting") else s("refresh"), pending == null) { send("refresh") }
    scroll.addView(column)
    setContentView(scroll)
  }
}
