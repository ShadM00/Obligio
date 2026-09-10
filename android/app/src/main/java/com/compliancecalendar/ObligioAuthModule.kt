package com.compliancecalendar

import android.app.Activity
import android.content.Intent
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.session.GetTokenOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ObligioAuthModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  override fun getName() = "ObligioAuth"

  /** The JS call waiting on the sign-in activity, if one is open. */
  private var pendingSignIn: Promise? = null

  private val activityListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      if (requestCode != SIGN_IN_REQUEST) return
      val promise = pendingSignIn ?: return
      pendingSignIn = null
      scope.launch {
        try {
          // Read the session back rather than trusting resultCode: finishing
          // the activity is not the same thing as a session existing.
          awaitReady()
          // Resolve either way. Backing out of sign-in is not a failure, and
          // JS re-reads the session after this returns, so a cancelled flow
          // lands the owner back on the welcome screen with no error banner.
          promise.resolve(null)
        } catch (error: Exception) {
          promise.reject("CLERK_SIGN_IN_ERROR", "Unable to load the authentication session.", error)
        }
      }
    }
  }

  init {
    context.addActivityEventListener(activityListener)
  }

  private suspend fun awaitReady() {
    withTimeout(20_000) { Clerk.isInitialized.first { it } }
  }

  @ReactMethod fun getToken(forceRefresh: Boolean, promise: Promise) {
    scope.launch {
      try {
        awaitReady()
        if (!Clerk.isSignedIn) { promise.resolve(null); return@launch }
        when (val result = Clerk.auth.getToken(GetTokenOptions(skipCache = forceRefresh))) {
          is ClerkResult.Success -> promise.resolve(result.value)
          is ClerkResult.Failure -> promise.reject("CLERK_TOKEN_ERROR", "Unable to refresh the authentication session. Please try again.")
        }
      } catch (error: Exception) {
        promise.reject("CLERK_TOKEN_ERROR", "Unable to load the authentication session.", error)
      }
    }
  }

  @ReactMethod fun isSignedIn(promise: Promise) {
    scope.launch {
      try { awaitReady(); promise.resolve(Clerk.isSignedIn) }
      catch (error: Exception) { promise.reject("CLERK_SESSION_ERROR", "Unable to load the authentication session.", error) }
    }
  }

  @ReactMethod fun signOut(promise: Promise) {
    scope.launch {
      try {
        awaitReady()
        if (Clerk.session == null) { promise.resolve(null); return@launch }
        when (Clerk.auth.signOut()) {
          is ClerkResult.Success -> promise.resolve(null)
          is ClerkResult.Failure -> promise.reject("CLERK_SIGN_OUT_ERROR", "Sign-out did not complete. Please try again.")
        }
      } catch (error: Exception) {
        promise.reject("CLERK_SIGN_OUT_ERROR", "Sign-out did not complete. Please try again.", error)
      }
    }
  }

  /**
   * Presents Clerk's sign-in flow.
   *
   * This used to reject unconditionally with "Use Clerk's native
   * authentication UI to start sign-in", so no Android user could ever sign
   * in. It went unnoticed because Clerk's frontend host did not resolve either,
   * and that failure surfaced first.
   */
  @ReactMethod fun signIn(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("CLERK_SIGN_IN_ERROR", "Sign-in could not be opened. Please try again.")
      return
    }
    if (pendingSignIn != null) {
      promise.reject("CLERK_SIGN_IN_IN_PROGRESS", "Sign-in is already open.")
      return
    }
    pendingSignIn = promise
    activity.startActivityForResult(Intent(activity, ClerkSignInActivity::class.java), SIGN_IN_REQUEST)
  }

  override fun invalidate() {
    reactApplicationContext.removeActivityEventListener(activityListener)
    pendingSignIn?.reject("CLERK_SIGN_IN_ERROR", "Sign-in was interrupted.")
    pendingSignIn = null
    scope.cancel()
    super.invalidate()
  }

  private companion object {
    const val SIGN_IN_REQUEST = 0x0B11
  }
}
