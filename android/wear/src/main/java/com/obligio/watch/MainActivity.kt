package com.obligio.watch

import android.app.Activity
import android.app.AlertDialog
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.graphics.Color
import android.view.Gravity
import android.widget.*
import com.google.android.gms.wearable.*
import org.json.JSONObject
import java.util.UUID

class MainActivity : Activity(), DataClient.OnDataChangedListener, MessageClient.OnMessageReceivedListener {
  private var snapshot = JSONObject()
  private var phoneNode: String? = null
  private var pending: String? = null
  private var completing: String? = null
  private var selected: String? = null
  private val handler = Handler(Looper.getMainLooper())
  private val mint = Color.rgb(140, 214, 180)
  override fun onCreate(state: Bundle?) { super.onCreate(state); render() }
  override fun onResume() {
    super.onResume()
    Wearable.getDataClient(this).addListener(this)
    Wearable.getMessageClient(this).addListener(this)
    Wearable.getDataClient(this).dataItems.addOnSuccessListener { buffer ->
      try { for (item in buffer) accept(item) } finally { buffer.release() }
    }.addOnFailureListener { notice("Pair this watch with your Android phone and open Obligio there.") }
  }
  override fun onPause() {
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
        notice("Completed. Your phone will sync the next deadline if this obligation repeats.")
      } else if (value.has("snapshot")) {
        val fresh = try { JSONObject(value.getString("snapshot")) } catch (_: Exception) { JSONObject() }
        if (fresh.has("version")) snapshot = fresh
        else notice("Open Obligio on your phone to sync.")
      }
      completing = null
      render()
    }
  }
  private fun send(action: String, itemId: String? = null) {
    if (pending != null) return
    val node = phoneNode
    if (node == null) { notice("Open Obligio on your paired Android phone to sync first."); return }
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
        notice("Phone unavailable. Open Obligio on your phone and try again.")
      }
    handler.postDelayed({
      if (pending == id) {
        pending = null; completing = null; render()
        notice("No reply. Refresh before retrying to check whether the item completed.")
      }
    }, 30000)
  }
  private fun notice(text: String) { if (!isFinishing) AlertDialog.Builder(this).setTitle("Obligio").setMessage(text).setPositiveButton("OK", null).show() }
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
    text("Obligio", 22f, mint)
    val items = snapshot.optJSONArray("items")
    val detail = if (items != null) (0 until items.length()).map { items.getJSONObject(it) }.firstOrNull { it.optString("id") == selected } else null
    if (selected != null && detail != null) {
      text(detail.optString("title"), 18f)
      text("Due ${detail.optString("dueDate")}")
      if (detail.optString("recurrence").isNotEmpty()) text("Repeats ${detail.optString("recurrence")}")
      if (detail.optString("status") == "current") text("✓ Completed", 16f, mint)
      else button(if (pending != null) "Saving…" else "Mark complete", pending == null) {
        AlertDialog.Builder(this).setTitle("Complete this obligation?")
          .setPositiveButton("Complete") { _, _ -> send("complete", detail.getString("id")) }
          .setNegativeButton("Cancel", null).show()
      }
      button("Back") { selected = null; render() }
    } else if (snapshot.optString("ownerId").isNotEmpty()) {
      text(snapshot.optString("businessName"), 16f)
      text("Last synced ${java.text.DateFormat.getTimeInstance(java.text.DateFormat.SHORT).format(java.util.Date(snapshot.optLong("updatedAt")))}", 12f, Color.LTGRAY)
      if (snapshot.optInt("totalCount") > (items?.length() ?: 0)) text("Showing ${items?.length() ?: 0} of ${snapshot.optInt("totalCount")}. Open your phone for all obligations.", 12f)
      if (items == null || items.length() == 0) text("No obligations yet. Add one on your phone.")
      else (0 until items.length()).map { items.getJSONObject(it) }.sortedBy { it.optString("dueDate") }.forEach { item ->
        val subtitle = if (item.optString("status") == "current") "✓ Completed" else item.optString("dueDate")
        button("${item.optString("title")}\n$subtitle") { selected = item.optString("id"); render() }
      }
    } else text("Open Obligio on your Android phone and sign in to sync your obligations.")
    button(if (pending != null) "Connecting…" else "Refresh", pending == null) { send("refresh") }
    scroll.addView(column)
    setContentView(scroll)
  }
}
