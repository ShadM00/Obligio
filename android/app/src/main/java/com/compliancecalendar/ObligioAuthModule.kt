package com.compliancecalendar

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
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ObligioAuthModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  override fun getName() = "ObligioAuth"

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

  @ReactMethod fun signIn(promise: Promise) {
    promise.reject("CLERK_SIGN_IN_UI_REQUIRED", "Use Clerk's native authentication UI to start sign-in")
  }

  override fun invalidate() {
    scope.cancel()
    super.invalidate()
  }
}
