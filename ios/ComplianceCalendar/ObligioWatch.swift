import Foundation
import WatchConnectivity
import React

@objc(ObligioWatch)
class ObligioWatch: NSObject, WCSessionDelegate {
  private let queue = DispatchQueue(label: "com.obligio.watch")
  private var snapshot = "{}"
  private var actions: [[String: Any]] = []
  private var replies: [String: ([String: Any]) -> Void] = [:]
  @objc static func requiresMainQueueSetup() -> Bool { false }
  override init() {
    super.init()
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }
  @objc func updateSnapshot(_ json: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    queue.async {
      self.snapshot = json
      self.publish()
      resolve(nil)
    }
  }
  private func publish() {
    guard WCSession.isSupported(), WCSession.default.activationState == .activated,
          WCSession.default.isPaired, WCSession.default.isWatchAppInstalled else { return }
    try? WCSession.default.updateApplicationContext(["snapshot": snapshot])
  }
  @objc func pendingActions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    queue.async {
      let pending = self.actions
      self.actions.removeAll()
      resolve(pending)
    }
  }
  @objc func reply(_ requestId: String, error: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    queue.async {
      self.replies.removeValue(forKey: requestId)?(["error": error ?? "", "snapshot": self.snapshot])
      resolve(nil)
    }
  }
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    queue.async { self.publish() }
  }
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { session.activate() }
  func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
    queue.async {
      if message["action"] as? String == "refresh" {
        replyHandler(["snapshot": self.snapshot]); return
      }
      guard message["action"] as? String == "complete",
            let requestId = message["requestId"] as? String,
            message["ownerId"] is String, message["businessId"] is String,
            message["requirementId"] is String,
            self.replies.count < 10, self.replies[requestId] == nil else {
        replyHandler(["error": "Unable to process this action. Refresh and try again."]); return
      }
      self.actions.append(message)
      self.replies[requestId] = replyHandler
      self.queue.asyncAfter(deadline: .now() + 25) {
        self.actions.removeAll { $0["requestId"] as? String == requestId }
        self.replies.removeValue(forKey: requestId)?(["error": "Open Obligio on your iPhone, refresh, then try again."])
      }
    }
  }
}

@objc(ObligioPreferences)
class ObligioPreferences: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }
  @objc func constantsToExport() -> [String: Any] {
    ["locale": UserDefaults.standard.string(forKey: "obligio.locale") ?? ""]
  }
  @objc func setLocale(_ locale: String) {
    guard ["en-US", "en-GB", "es-US", "fr-CA"].contains(locale) else { return }
    UserDefaults.standard.set(locale, forKey: "obligio.locale")
  }
}
