import SwiftUI
import WatchConnectivity

struct Obligation: Codable, Identifiable {
  let id: String
  let title: String
  let dueDate: String
  var status: String
  let recurrence: String
  // Version 2: already formatted and translated by the phone.
  let dueLabel: String?
  let repeatsLabel: String?
}
struct Snapshot: Codable {
  let version: Int
  let businessId: String
  let ownerId: String
  let businessName: String
  let updatedAt: Double
  let totalCount: Int
  var items: [Obligation]
  // Version 2. Optional so a snapshot from an older phone build still decodes.
  let locale: String?
  let strings: [String: String]?
  let truncationNote: String?
}

/// The watch speaks the language the owner chose in the phone app, which the
/// phone sends with each snapshot. The English here is only for a watch that
/// has never synced.
enum Fallback {
  static let strings: [String: String] = [
    "title": "Obligio", "deadline": "Deadline", "synced": "Synced {ago}",
    "noObligations": "No obligations yet. Add one on your phone.",
    "signInOnPhone": "Open Obligio on your phone and sign in to sync your obligations.",
    "refresh": "Refresh", "connecting": "Connecting…", "markComplete": "Mark complete",
    "saving": "Saving…", "confirmTitle": "Complete this obligation?", "complete": "Complete",
    "cancel": "Cancel", "ok": "OK", "completedStatus": "Completed",
    "completedFeedback": "Completed. Your phone will sync the next deadline if this obligation repeats.",
    "openPhone": "Open Obligio on your paired phone and keep it nearby.",
    "noReply": "No reply. Refresh before retrying to check whether the item completed.",
    "itemGone": "This obligation is no longer available. Refresh your watch.",
  ]
}
final class WatchStore: NSObject, ObservableObject, WCSessionDelegate {
  @Published var snapshot: Snapshot?
  @Published var busy = false
  @Published var feedback: String?
  /// Opens straight onto one obligation. Only ever set for store screenshots.
  var openOnLaunch: String?

  func t(_ key: String) -> String { snapshot?.strings?[key] ?? Fallback.strings[key] ?? key }

  /// "Synced 2 minutes ago", composed in the phone's language rather than the watch's.
  func syncedText(now: Date) -> String {
    guard let snapshot = snapshot else { return "" }
    let formatter = RelativeDateTimeFormatter()
    formatter.locale = Locale(identifier: snapshot.locale ?? "en-US")
    formatter.unitsStyle = .full
    let ago = formatter.localizedString(for: Date(timeIntervalSince1970: snapshot.updatedAt / 1000), relativeTo: now)
    return t("synced").replacingOccurrences(of: "{ago}", with: ago)
  }

  override init() {
    super.init()
    #if DEBUG
    // Store screenshots: show sample data the phone's own code produced
    // (scripts/watch-fixtures) instead of waiting for a paired phone.
    // Compiled out of release builds.
    let env = ProcessInfo.processInfo.environment
    if let fixture = env["OBLIGIO_WATCH_FIXTURE"], let data = fixture.data(using: .utf8),
       let value = try? JSONDecoder().decode(Snapshot.self, from: data) {
      snapshot = value
      openOnLaunch = env["OBLIGIO_WATCH_OPEN"]
      return
    }
    #endif
    WCSession.default.delegate = self
    WCSession.default.activate()
    accept(WCSession.default.receivedApplicationContext)
  }
  private func accept(_ context: [String: Any]) {
    guard let json = context["snapshot"] as? String, let data = json.data(using: .utf8),
          let value = try? JSONDecoder().decode(Snapshot.self, from: data) else { return }
    DispatchQueue.main.async { self.snapshot = value }
  }
  func refresh() { send(["action": "refresh"]) }
  func complete(_ item: Obligation) {
    guard let snapshot = snapshot else { return }
    send(["action": "complete", "requestId": UUID().uuidString,
          "ownerId": snapshot.ownerId, "businessId": snapshot.businessId,
          "requirementId": item.id], completedId: item.id)
  }
  private func send(_ message: [String: Any], completedId: String? = nil) {
    guard !busy else { return }
    guard WCSession.default.activationState == .activated, WCSession.default.isReachable else {
      feedback = t("openPhone"); return
    }
    busy = true
    WCSession.default.sendMessage(message, replyHandler: { reply in
      self.accept(reply)
      DispatchQueue.main.async {
        self.busy = false
        if let error = reply["error"] as? String, !error.isEmpty { self.feedback = error }
        else if let id = completedId {
          if let index = self.snapshot?.items.firstIndex(where: { $0.id == id }) { self.snapshot?.items[index].status = "current" }
          self.feedback = self.t("completedFeedback")
        }
      }
    }, errorHandler: { _ in
      DispatchQueue.main.async {
        self.busy = false
        self.feedback = self.t("noReply")
      }
    })
  }
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    accept(session.receivedApplicationContext)
  }
  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) { accept(applicationContext) }
}

@main
struct ObligioWatchApp: App {
  @StateObject private var store = WatchStore()
  var body: some Scene { WindowGroup { WatchHome().environmentObject(store) } }
}
struct WatchHome: View {
  @EnvironmentObject var store: WatchStore
  @State private var path: [String] = []
  var body: some View {
    NavigationStack(path: $path) {
      List {
        if let snapshot = store.snapshot, !snapshot.ownerId.isEmpty {
          Text(snapshot.businessName).font(.headline).foregroundStyle(.mint)
          TimelineView(.periodic(from: .now, by: 60)) { context in
            Text(verbatim: store.syncedText(now: context.date)).font(.caption2).foregroundStyle(.secondary)
          }
          if let note = snapshot.truncationNote, !note.isEmpty { Text(verbatim: note).font(.caption2) }
          if snapshot.items.isEmpty { Text(verbatim: store.t("noObligations")) }
          // The phone sends items already ordered: open deadlines by date, completed last.
          ForEach(snapshot.items) { item in
            NavigationLink(value: item.id) {
              VStack(alignment: .leading, spacing: 4) {
                Text(verbatim: item.title).font(.headline)
                Text(verbatim: item.status == "current" ? store.t("completedStatus") : (item.dueLabel ?? item.dueDate))
                  .font(.caption).foregroundStyle(item.status == "current" ? .mint : .secondary)
              }
            }
          }
        } else {
          Text(verbatim: store.t("signInOnPhone"))
        }
        Button(store.busy ? store.t("connecting") : store.t("refresh"), action: store.refresh).disabled(store.busy)
      }.navigationTitle(store.t("title"))
        .navigationDestination(for: String.self) { WatchDetail(itemId: $0) }
        .alert(store.t("title"), isPresented: Binding(get: { store.feedback != nil }, set: { if !$0 { store.feedback = nil } })) {
          Button(store.t("ok")) { store.feedback = nil }
        } message: { Text(verbatim: store.feedback ?? "") }
    }.tint(.mint)
      .onAppear { if let id = store.openOnLaunch { path = [id]; store.openOnLaunch = nil } }
  }
}
struct WatchDetail: View {
  @EnvironmentObject var store: WatchStore
  let itemId: String
  @State private var confirming = false
  var body: some View {
    ScrollView {
      if let item = store.snapshot?.items.first(where: { $0.id == itemId }) {
        VStack(alignment: .leading, spacing: 12) {
          Text(verbatim: item.title).font(.headline)
          Text(verbatim: item.dueLabel ?? "Due \(item.dueDate)")
          if !item.recurrence.isEmpty {
            Text(verbatim: item.repeatsLabel ?? "Repeats \(item.recurrence)").font(.caption).foregroundStyle(.secondary)
          }
          if item.status == "current" {
            Label(store.t("completedStatus"), systemImage: "checkmark.circle.fill").foregroundStyle(.mint)
          } else {
            Button(store.busy ? store.t("saving") : store.t("markComplete")) { confirming = true }
              .disabled(store.busy)
              .confirmationDialog(store.t("confirmTitle"), isPresented: $confirming, titleVisibility: .visible) {
                Button(store.t("complete")) { store.complete(item) }
                Button(store.t("cancel"), role: .cancel) {}
              }
          }
        }.padding(.horizontal, 6)
      } else { Text(verbatim: store.t("itemGone")) }
    }.navigationTitle(store.t("deadline"))
  }
}
