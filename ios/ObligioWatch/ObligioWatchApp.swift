import SwiftUI
import WatchConnectivity

struct Obligation: Codable, Identifiable {
  let id: String
  let title: String
  let dueDate: String
  var status: String
  let recurrence: String
}
struct Snapshot: Codable {
  let version: Int
  let businessId: String
  let ownerId: String
  let businessName: String
  let updatedAt: Double
  let totalCount: Int
  var items: [Obligation]
}
final class WatchStore: NSObject, ObservableObject, WCSessionDelegate {
  @Published var snapshot: Snapshot?
  @Published var busy = false
  @Published var feedback: String?
  override init() {
    super.init()
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
      feedback = "Open Obligio on your paired iPhone and keep it nearby."; return
    }
    busy = true
    WCSession.default.sendMessage(message, replyHandler: { reply in
      self.accept(reply)
      DispatchQueue.main.async {
        self.busy = false
        if let error = reply["error"] as? String, !error.isEmpty { self.feedback = error }
        else if let id = completedId {
          if let index = self.snapshot?.items.firstIndex(where: { $0.id == id }) { self.snapshot?.items[index].status = "current" }
          self.feedback = "Completed. Your phone will sync the next deadline if this obligation repeats."
        }
      }
    }, errorHandler: { _ in
      DispatchQueue.main.async {
        self.busy = false
        self.feedback = "Connection lost. Refresh before retrying to check whether the item completed."
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
  var body: some View {
    NavigationStack {
      List {
        if let snapshot = store.snapshot, !snapshot.ownerId.isEmpty {
          Text(snapshot.businessName).font(.headline).foregroundStyle(.mint)
          Text("Synced \(Date(timeIntervalSince1970: snapshot.updatedAt / 1000), style: .relative) ago")
            .font(.caption2).foregroundStyle(.secondary)
          if snapshot.totalCount > snapshot.items.count { Text("Showing \(snapshot.items.count) of \(snapshot.totalCount). Open your phone for all obligations.").font(.caption2) }
          if snapshot.items.isEmpty { Text("No obligations yet. Add one on your phone.") }
          ForEach(snapshot.items.sorted { $0.dueDate < $1.dueDate }) { item in
            NavigationLink { WatchDetail(itemId: item.id) } label: {
              VStack(alignment: .leading, spacing: 4) {
                Text(item.title).font(.headline)
                Text(item.status == "current" ? "Completed" : item.dueDate).font(.caption).foregroundStyle(item.status == "current" ? .mint : .secondary)
              }
            }
          }
        } else {
          Text("Open Obligio on your iPhone and sign in to sync your obligations.")
        }
        Button(store.busy ? "Connecting…" : "Refresh", action: store.refresh).disabled(store.busy)
      }.navigationTitle("Obligio")
        .alert("Obligio", isPresented: Binding(get: { store.feedback != nil }, set: { if !$0 { store.feedback = nil } })) {
          Button("OK") { store.feedback = nil }
        } message: { Text(store.feedback ?? "") }
    }.tint(.mint)
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
          Text(item.title).font(.headline)
          Text("Due \(item.dueDate)")
          if !item.recurrence.isEmpty { Text("Repeats \(item.recurrence)").font(.caption).foregroundStyle(.secondary) }
          if item.status == "current" { Label("Completed", systemImage: "checkmark.circle.fill").foregroundStyle(.mint) }
          else {
            Button(store.busy ? "Saving…" : "Mark complete") { confirming = true }
              .disabled(store.busy)
              .confirmationDialog("Complete this obligation?", isPresented: $confirming, titleVisibility: .visible) {
                Button("Complete") { store.complete(item) }
                Button("Cancel", role: .cancel) {}
              }
          }
        }.padding(.horizontal, 6)
      } else { Text("This item is no longer available. Refresh your watch.") }
    }.navigationTitle("Deadline")
  }
}
