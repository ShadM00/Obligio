package com.compliancecalendar

import android.app.Activity
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.clerk.ui.auth.AuthView

/**
 * Presents Clerk's prebuilt sign-in flow.
 *
 * iOS gets this from `startHostedAuth`, which opens Clerk's hosted page. The
 * Android SDK has no equivalent one-call entry point — it ships sign-in
 * primitives and a Compose UI — so the bridge launches this activity instead,
 * and `ObligioAuthModule` resolves once it finishes.
 *
 * It reports only completed or cancelled. Whether a session actually exists is
 * read back from Clerk by the module rather than trusted from here, so a flow
 * that finishes without signing anyone in cannot be mistaken for a sign-in.
 */
class ClerkSignInActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      AuthView(
        onAuthComplete = {
          setResult(Activity.RESULT_OK)
          finish()
        },
      )
    }
  }
}
