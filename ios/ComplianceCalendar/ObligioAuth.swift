import Foundation
@preconcurrency import React
import ClerkKit
import AuthenticationServices

@objc(ObligioAuth)
final class ObligioAuth: NSObject {
  private final class PromiseBox: @unchecked Sendable {
    let resolve: RCTPromiseResolveBlock
    let reject: RCTPromiseRejectBlock
    init(_ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) { self.resolve = resolve; self.reject = reject }
  }
  @objc static func requiresMainQueueSetup() -> Bool { true }

  @objc(configure:resolver:rejecter:)
  func configure(_ publishableKey: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      Clerk.configure(publishableKey: publishableKey)
      callbacks.resolve(nil)
    }
  }

  @objc(getToken:resolver:rejecter:)
  func getToken(_ forceRefresh: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      do { callbacks.resolve(try await Clerk.shared.auth.getToken(.init(skipCache: forceRefresh))) }
      catch { callbacks.reject("CLERK_TOKEN_ERROR", error.localizedDescription, error) }
    }
  }

  @objc(signIn:rejecter:)
  func signIn(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      do { _ = try await Clerk.shared.auth.startHostedAuth(mode: .signIn); callbacks.resolve(nil) }
      catch { callbacks.reject("CLERK_SIGN_IN_ERROR", error.localizedDescription, error) }
    }
  }

  /// Sign in with Apple, presented natively rather than through the hosted
  /// page. App Store guideline 4.8 wants it offered wherever a third-party
  /// login is, and offered at least as prominently.
  @objc(signInWithApple:rejecter:)
  func signInWithApple(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      do { _ = try await Clerk.shared.auth.signInWithApple(); callbacks.resolve(nil) }
      catch {
        if (error as NSError).code == ASAuthorizationError.canceled.rawValue {
          callbacks.reject("CLERK_SIGN_IN_CANCELLED", "Sign in cancelled.", nil)
        } else {
          callbacks.reject("CLERK_SIGN_IN_ERROR", error.localizedDescription, error)
        }
      }
    }
  }

  @objc(signOut:rejecter:)
  func signOut(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      do { try await Clerk.shared.auth.signOut(); callbacks.resolve(nil) }
      catch { callbacks.reject("CLERK_SIGN_OUT_ERROR", error.localizedDescription, error) }
    }
  }

  @objc(isSignedIn:rejecter:)
  func isSignedIn(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in callbacks.resolve(Clerk.shared.session != nil) }
  }

  @objc(deleteAccount:rejecter:)
  func deleteAccount(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let callbacks = PromiseBox(resolve, reject)
    Task { @MainActor in
      do {
        guard let user = Clerk.shared.user else {
          callbacks.reject("CLERK_DELETE_ERROR", "Sign in again to finish deleting your account.", nil)
          return
        }
        try await user.delete()
        callbacks.resolve(nil)
      } catch { callbacks.reject("CLERK_DELETE_ERROR", error.localizedDescription, error) }
    }
  }
}
